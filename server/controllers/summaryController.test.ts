import { type Request, type Response } from 'express'
import nock from 'nock'
import { auditService } from '@ministryofjustice/hmpps-audit-client'
import SummaryController from './summaryController'
import config from '../config'
import { auditAction } from '../utils/testUtils'
import { AuditEvent, AuditSubjectType } from '../audit'

let fakeApi: nock.Scope

beforeEach(() => {
  jest.resetAllMocks()
  jest.spyOn(auditService, 'sendAuditMessage').mockResolvedValue()
  fakeApi = nock(config.apis.subjectAccessRequest.url)
})

afterEach(() => {
  jest.resetAllMocks()
  nock.cleanAll()
})

describe('getReportDetails', () => {
  const res: Response = {
    render: jest.fn(),
  } as unknown as Response

  test('renders a response with session data', async () => {
    const req: Request = {
      session: {
        userData: {
          subjectId: 'A1111AA',
          dateFrom: '01/01/2001',
          dateTo: '25/12/2022',
          caseReference: 'mockedCaseReference',
        },
        selectedList: [{ name: 'service-one', label: 'Service One', url: 'hmpps-service-one.com', disabled: false }],
      },
    } as unknown as Request
    SummaryController.getReportDetails(req, res)
    expect(res.render).toHaveBeenCalled()
    expect(res.render).toHaveBeenCalledWith(
      'pages/summary',
      expect.objectContaining({
        subjectId: 'A1111AA',
        selectedList: 'Service One',
        dateRange: '01/01/2001 - 25/12/2022',
        caseReference: req.session.userData.caseReference,
      }),
    )
  })
})

describe('postReportDetails', () => {
  const res: Response = {
    redirect: jest.fn(),
    locals: {
      user: {
        token: 'fakeUserToken',
        authSource: 'auth',
        username: 'username',
      },
    },
  } as unknown as Response

  describe('auditing', () => {
    const req = {
      session: {
        userData: {
          dateFrom: '01/01/2001',
          dateTo: '25/12/2022',
          caseReference: 'mockedCaseReference',
          subjectId: 'A1111AA',
        },
        selectedList: [
          { id: 'product-one', name: 'service-one', label: 'Service One', url: 'https://one.example.com' },
          { id: 'product-two', name: 'service-two', label: 'Service Two', url: 'https://two.example.com' },
        ],
      },
      user: { token: 'fakeUserToken', authSource: 'auth' },
    } as unknown as Request

    const expectedAuditMessage = (action: AuditEvent) => ({
      action,
      who: 'username',
      subjectId: 'A1111AA',
      subjectType: AuditSubjectType.SAR_SUBJECT_ID,
      correlationId: expect.any(String),
      service: config.apis.audit.serviceName,
      details: JSON.stringify({
        dateFrom: '01/01/2001',
        dateTo: '25/12/2022',
        sarCaseReferenceNumber: 'mockedCaseReference',
        services: ['service-one', 'service-two'],
        nomisId: 'A1111AA',
        ndeliusId: null,
        selectedProducts: [
          { id: 'product-one', name: 'service-one', label: 'Service One' },
          { id: 'product-two', name: 'service-two', label: 'Service Two' },
        ],
      }),
    })

    test('audits the full request when the request is attempted', async () => {
      fakeApi.post('/api/subjectAccessRequest').reply(200)

      await SummaryController.postReportDetailsAndReturnResponse(req, res)

      expect(auditService.sendAuditMessage).toHaveBeenCalledTimes(1)
      expect(auditService.sendAuditMessage).toHaveBeenCalledWith(
        expectedAuditMessage(AuditEvent.REQUEST_REPORT_ATTEMPT),
      )
    })

    test('audits the full request when the request fails', async () => {
      fakeApi.post('/api/subjectAccessRequest').reply(400)

      await expect(SummaryController.postReportDetailsAndReturnResponse(req, res)).rejects.toThrow('Bad Request')

      expect(auditService.sendAuditMessage).toHaveBeenCalledTimes(2)
      expect(auditService.sendAuditMessage).toHaveBeenNthCalledWith(
        1,
        expectedAuditMessage(AuditEvent.REQUEST_REPORT_ATTEMPT),
      )
      expect(auditService.sendAuditMessage).toHaveBeenNthCalledWith(
        2,
        expectedAuditMessage(AuditEvent.REQUEST_REPORT_FAILURE),
      )
    })
  })

  test('post request made to SubjectAccessRequest endpoint renders confirmation page if successful', async () => {
    const req: Request = {
      session: {
        userData: {
          dateFrom: '01/01/2001',
          dateTo: '25/12/2022',
          caseReference: 'mockedCaseReference',
          subjectId: 'A1111AA',
        },
        selectedList: [{ name: 'service-one', label: 'service1', url: 'hmpps-service-one.com', disabled: false }],
      },
      user: {
        token: 'fakeUserToken',
        authSource: 'auth',
      },
    } as unknown as Request

    fakeApi
      .post(
        '/api/subjectAccessRequest',
        '{"dateFrom":"01/01/2001","dateTo":"25/12/2022","sarCaseReferenceNumber":"mockedCaseReference","services":["service-one"],"nomisId":"A1111AA","ndeliusId":null}',
      )
      .reply(200)

    const response = await SummaryController.postReportDetailsAndReturnResponse(req, res)
    expect(response.status).toBe(200)
    expect(res.redirect).toHaveBeenCalled()
    expect(res.redirect).toHaveBeenCalledWith('/confirmation')
  })

  test('post request fails if neither nomisId nor ndeluisCaseReferenceId is provided', async () => {
    const req: Request = {
      session: {
        userData: {
          dateFrom: '01/01/2001',
          dateTo: '25/12/2022',
          caseReference: 'mockedCaseReference',
          subjectId: '',
        },
        selectedList: [{ name: 'service-one', label: 'service1', url: 'hmpps-service-one.com', disabled: false }],
      },
      user: {
        token: 'fakeUserToken',
        authSource: 'auth',
      },
    } as unknown as Request
    nock(config.apis.subjectAccessRequest.url)
      .post(
        '/api/subjectAccessRequest',
        '{"dateFrom":"01/01/2001","dateTo":"25/12/2022","sarCaseReferenceNumber":"mockedCaseReference","services":["service-one"],"nomisId":null,"ndeliusId":null}',
      )
      .reply(400)
    await expect(SummaryController.postReportDetailsAndReturnResponse(req, res)).rejects.toThrow('Bad Request')
  })

  test('post request sends userToken to authenticate with API', async () => {
    fakeApi = nock(config.apis.subjectAccessRequest.url, {
      reqheaders: {
        authorization: 'Bearer fakeUserToken',
      },
    })
      .post(
        '/api/subjectAccessRequest',
        '{"dateFrom":"01/01/2001","dateTo":"25/12/2022","sarCaseReferenceNumber":"mockedCaseReference","services":["service-one"],"nomisId":"A1111AA","ndeliusId":null}',
      )
      .reply(200)

    const req: Request = {
      session: {
        userData: {
          dateFrom: '01/01/2001',
          dateTo: '25/12/2022',
          caseReference: 'mockedCaseReference',
          subjectId: 'A1111AA',
        },
        selectedList: [{ name: 'service-one', label: 'service1', url: 'hmpps-service-one.com', disabled: false }],
      },
      user: {
        token: 'fakeUserToken',
        authSource: 'auth',
      },
    } as unknown as Request

    const response = await SummaryController.postReportDetailsAndReturnResponse(req, res)
    expect(response.status).toBe(200)
    expect(res.redirect).toHaveBeenCalledWith('/confirmation')

    expect(auditService.sendAuditMessage).toHaveBeenCalledWith(auditAction(AuditEvent.REQUEST_REPORT_ATTEMPT))
  })

  test('post request send subject ID capitalised when provided in lowercase', async () => {
    const req: Request = {
      session: {
        userData: {
          dateFrom: '01/01/2001',
          dateTo: '25/12/2022',
          caseReference: 'mockedCaseReference',
          subjectId: 'a1111aa',
        },
        selectedList: [{ name: 'service-one', label: 'service1', url: 'hmpps-service-one.com', disabled: false }],
      },
      user: {
        token: 'fakeUserToken',
        authSource: 'auth',
      },
    } as unknown as Request

    fakeApi
      .post(
        '/api/subjectAccessRequest',
        '{"dateFrom":"01/01/2001","dateTo":"25/12/2022","sarCaseReferenceNumber":"mockedCaseReference","services":["service-one"],"nomisId":"A1111AA","ndeliusId":null}',
      )
      .reply(200)

    const response = await SummaryController.postReportDetailsAndReturnResponse(req, res)
    expect(response.status).toBe(200)

    expect(auditService.sendAuditMessage).toHaveBeenCalledWith(auditAction(AuditEvent.REQUEST_REPORT_ATTEMPT))
  })
})
