import { type Request, type Response } from 'express'
import nock from 'nock'
import SummaryController from './summaryController'
import config from '../config'

SummaryController.getSystemToken = jest.fn().mockReturnValue('testtoken')

let fakeApi: nock.Scope

beforeEach(() => {
  fakeApi = nock(config.apis.subjectAccessRequest.url)
})

afterEach(() => {
  jest.resetAllMocks()
  nock.cleanAll()
})

describe('getReportDetails', () => {
  // @ts-expect-error stubbing res.render
  const res: Response = {
    render: jest.fn(),
  }

  test('renders a response with session data', async () => {
    const req: Request = {
      // @ts-expect-error stubbing session
      session: {
        userData: {
          subjectId: 'A1111AA',
          dateFrom: '01/01/2001',
          dateTo: '25/12/2022',
          caseReference: 'mockedCaseReference',
        },
        selectedList: [{ id: '1', text: 'service1' }],
      },
    }
    SummaryController.getReportDetails(req, res)
    expect(res.render).toHaveBeenCalled()
    expect(res.render).toBeCalledWith(
      'pages/summary',
      expect.objectContaining({
        subjectId: 'A1111AA',
        selectedList: 'service1',
        dateRange: '01/01/2001 - 25/12/2022',
        caseReference: req.session.userData.caseReference,
      }),
    )
  })
})

describe('postReportDetails', () => {
  // @ts-expect-error stubbing res
  const res: Response = {
    redirect: jest.fn(),
  }

  test('post request made to createSubjectAccessRequest endpoint renders confirmation page if successful', async () => {
    const req: Request = {
      // @ts-expect-error stubbing session
      session: {
        userData: {
          dateFrom: '01/01/2001',
          dateTo: '25/12/2022',
          caseReference: 'mockedCaseReference',
          subjectId: 'A1111AA',
        },
        selectedList: [{ id: '1', text: 'service1', urls: '.com' }],
      },
      user: {
        token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX3V1aWQiOiJtb2NrZWRVc2VySWQiLCJuYW1lIjoiRXhhbXBsZSBVc2VyIn0.KcjDfjwlAS8Jlz7swp-X2FlSyRAFtEKvQ6WuzLSzAaU',
        authSource: 'auth',
      },
    }

    fakeApi
      .post(
        '/api/createSubjectAccessRequest',
        '{"dateFrom":"01/01/2001","dateTo":"25/12/2022","sarCaseReferenceNumber":"mockedCaseReference","services":"service1, .com","nomisId":"A1111AA","ndeliusId":"","requestedBy":"mockedUserId"}',
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
        selectedList: [{ id: '1', text: 'service1', urls: '.com' }],
      },
      user: {
        token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX3V1aWQiOiJtb2NrZWRVc2VySWQiLCJuYW1lIjoiRXhhbXBsZSBVc2VyIn0.KcjDfjwlAS8Jlz7swp-X2FlSyRAFtEKvQ6WuzLSzAaU',
        authSource: 'auth',
      },
    }
    nock(config.apis.subjectAccessRequest.url)
      .post(
        '/api/createSubjectAccessRequest',
        '{"dateFrom":"01/01/2001","dateTo":"25/12/2022","sarCaseReferenceNumber":"mockedCaseReference","services":"service1, .com","nomisId":"","ndeliusId":"","requestedBy":"mockedUserId"}',
      )
      .reply(400)
    await expect(SummaryController.postReportDetails(req, res)).rejects.toThrowError('Bad Request')
  })

  test('post request fails if no user ID could be found', async () => {
    const req: Request = {
      // @ts-expect-error stubbing session
      session: {
        userData: {
          dateFrom: '01/01/2001',
          dateTo: '25/12/2022',
          caseReference: 'mockedCaseReference',
          subjectId: 'A123456',
        },
        selectedList: [{ id: '1', text: 'service1', urls: '.com' }],
      },
      user: {
        token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        authSource: 'auth',
      },
    }
    await expect(SummaryController.postReportDetails(req, res)).rejects.toThrowError(
      'Could not identify SAR requestor. RequestedBy field is null.',
    )
  })
})
