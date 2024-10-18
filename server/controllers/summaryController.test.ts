import { type Request, type Response } from 'express'
import nock from 'nock'
import { auditService } from '@ministryofjustice/hmpps-audit-client'
import SummaryController from './summaryController'
import config from '../config'
import { auditAction } from '../utils/testUtils'
import { AuditEvent } from '../audit'

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
  const res: Partial<Response> = {
    render: jest.fn(),
  }

  test('renders a response with session data', async () => {
    const req: Partial<Request> = {
      session: {
        userData: {
          subjectId: 'A1111AA',
          dateFrom: '01/01/2001',
          dateTo: '25/12/2022',
          caseReference: 'mockedCaseReference',
        },
        selectedList: [{ id: 'service-one', name: 'Service One', url: 'hmpps-service-one.com', disabled: false }],
      },
    }
    SummaryController.getReportDetails(req, res)
    expect(res.render).toHaveBeenCalled()
    expect(res.render).toBeCalledWith(
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
  const res: Partial<Response> = {
    redirect: jest.fn(),
    locals: {
      user: {
        token: 'fakeUserToken',
        authSource: 'auth',
        username: 'username',
      },
    },
  }

  test('post request made to SubjectAccessRequest endpoint renders confirmation page if successful', async () => {
    const req: Partial<Request> = {
      session: {
        userData: {
          dateFrom: '01/01/2001',
          dateTo: '25/12/2022',
          caseReference: 'mockedCaseReference',
          subjectId: 'A1111AA',
        },
        selectedList: [{ id: 'service-one', name: 'service1', url: 'hmpps-service-one.com', disabled: false }],
      },
      user: {
        token: 'fakeUserToken',
        authSource: 'auth',
      },
    }

    fakeApi
      .post(
        '/api/subjectAccessRequest',
        '{"dateFrom":"01/01/2001","dateTo":"25/12/2022","sarCaseReferenceNumber":"mockedCaseReference","services":"service-one, hmpps-service-one.com","nomisId":"A1111AA","ndeliusId":null}',
      )
      .reply(200)

    const response = await SummaryController.postReportDetails(req, res)
    expect(response.status).toBe(200)
    expect(res.redirect).toHaveBeenCalled()
    expect(res.redirect).toBeCalledWith('/confirmation')
  })

  test('post request fails if neither nomisId nor ndeluisCaseReferenceId is provided', async () => {
    const req: Request = {
      // @ts-expect-error stubbing session
      session: {
        userData: {
          dateFrom: '01/01/2001',
          dateTo: '25/12/2022',
          caseReference: 'mockedCaseReference',
          subjectId: '',
        },
        selectedList: [{ id: 'service-one', name: 'service1', url: 'hmpps-service-one.com', disabled: false }],
      },
      user: {
        token: 'fakeUserToken',
        authSource: 'auth',
      },
    }
    nock(config.apis.subjectAccessRequest.url)
      .post(
        '/api/subjectAccessRequest',
        '{"dateFrom":"01/01/2001","dateTo":"25/12/2022","sarCaseReferenceNumber":"mockedCaseReference","services":"service-one, hmpps-service-one.com","nomisId":null,"ndeliusId":null}',
      )
      .reply(400)
    await expect(SummaryController.postReportDetails(req, res)).rejects.toThrowError('Bad Request')
  })

  test('post request sends userToken to authenticate with API', async () => {
    fakeApi = nock(config.apis.subjectAccessRequest.url, {
      reqheaders: {
        authorization: 'Bearer fakeUserToken',
      },
    })
      .post(
        '/api/subjectAccessRequest',
        '{"dateFrom":"01/01/2001","dateTo":"25/12/2022","sarCaseReferenceNumber":"mockedCaseReference","services":"service-one, hmpps-service-one.com","nomisId":"A1111AA","ndeliusId":null}',
      )
      .reply(200)

    const req: Request = {
      // @ts-expect-error stubbing session
      session: {
        userData: {
          dateFrom: '01/01/2001',
          dateTo: '25/12/2022',
          caseReference: 'mockedCaseReference',
          subjectId: 'A1111AA',
        },
        selectedList: [{ id: 'service-one', name: 'service1', url: 'hmpps-service-one.com', disabled: false }],
      },
      user: {
        token: 'fakeUserToken',
        authSource: 'auth',
      },
    }

    const response = await SummaryController.postReportDetails(req, res)
    expect(response.status).toBe(200)
    expect(res.redirect).toHaveBeenCalledWith('/confirmation')

    expect(auditService.sendAuditMessage).toHaveBeenCalledWith(auditAction(AuditEvent.REQUEST_REPORT_ATTEMPT))
  })

  test('post request send subject ID capitalised when provided in lowercase', async () => {
    const req: Request = {
      // @ts-expect-error stubbing session
      session: {
        userData: {
          dateFrom: '01/01/2001',
          dateTo: '25/12/2022',
          caseReference: 'mockedCaseReference',
          subjectId: 'a1111aa',
        },
        selectedList: [{ id: 'service-one', name: 'service1', url: 'hmpps-service-one.com', disabled: false }],
      },
      user: {
        token: 'fakeUserToken',
        authSource: 'auth',
      },
    }

    fakeApi
      .post(
        '/api/subjectAccessRequest',
        '{"dateFrom":"01/01/2001","dateTo":"25/12/2022","sarCaseReferenceNumber":"mockedCaseReference","services":"service-one, hmpps-service-one.com","nomisId":"A1111AA","ndeliusId":null}',
      )
      .reply(200)

    const response = await SummaryController.postReportDetails(req, res)
    expect(response.status).toBe(200)

    expect(auditService.sendAuditMessage).toHaveBeenCalledWith(auditAction(AuditEvent.REQUEST_REPORT_ATTEMPT))
  })
})
