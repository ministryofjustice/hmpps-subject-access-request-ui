import { type Request, type Response } from 'express'
import nock from 'nock'
import SummaryController from './summaryController'
import config from '../config'

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

  test('post request made to SubjectAccessRequest endpoint renders confirmation page if successful', async () => {
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
        token: 'fakeUserToken',
        authSource: 'auth',
      },
    }

    fakeApi
      .post(
        '/api/subjectAccessRequest',
        '{"dateFrom":"01/01/2001","dateTo":"25/12/2022","sarCaseReferenceNumber":"mockedCaseReference","services":"service1, .com","nomisId":"A1111AA","ndeliusId":""}',
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
        token: 'fakeUserToken',
        authSource: 'auth',
      },
    }
    nock(config.apis.subjectAccessRequest.url)
      .post(
        '/api/subjectAccessRequest',
        '{"dateFrom":"01/01/2001","dateTo":"25/12/2022","sarCaseReferenceNumber":"mockedCaseReference","services":"service1, .com","nomisId":"","ndeliusId":""}',
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
        '{"dateFrom":"01/01/2001","dateTo":"25/12/2022","sarCaseReferenceNumber":"mockedCaseReference","services":"service1, .com","nomisId":"A1111AA","ndeliusId":""}',
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
        selectedList: [{ id: '1', text: 'service1', urls: '.com' }],
      },
      user: {
        token: 'fakeUserToken',
        authSource: 'auth',
      },
    }

    const response = await SummaryController.postReportDetails(req, res)
    expect(response.status).toBe(200)
    expect(res.redirect).toHaveBeenCalled()
    expect(res.redirect).toBeCalledWith('/confirmation')
  })
})
