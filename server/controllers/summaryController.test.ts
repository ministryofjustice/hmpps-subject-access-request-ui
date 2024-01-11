import { type Request, type Response } from 'express'
import nock from 'nock'
import SummaryController from './summaryController'
import config from '../config'

afterEach(() => {
  jest.resetAllMocks()
  nock.cleanAll()
})

let fakeApi: nock.Scope

beforeEach(() => {
  // config.apis.tokenVerification.url = 'http://localhost:8100'
  fakeApi = nock(config.apis.createSubjectAccessRequest.url)
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
        serviceList: [],
        userData: {
          subjectId: 'A1111AA',
          dateFrom: '01/01/2001',
          dateTo: '25/12/2022',
          caseReference: 'mockedCaseReference',
        },
        selectedList: [{ id: '1', text: 'service1' }],
      },
      body: { selectedservices: [] },
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
describe('postSARAPI', () => {
  // @ts-expect-error stubbing res
  const res: Response = {
    redirect: jest.fn(),
  }

  test('post request made to SAR endpoint on clicking confirm', async () => {
    const req: Request = {
      // @ts-expect-error stubbing session
      session: {
        serviceList: [],
        userData: {
          dateFrom: '01/01/2001',
          dateTo: '25/12/2022',
          caseReference: 'mockedCaseReference',
          subjectId: '16',
          ndeliusCaseReferenceId: '',
        },
        selectedList: [{ id: '1', text: 'service1', value: '.com' }],
      },
      body: { selectedservices: [] },
    }

    const test2 = nock(config.apis.createSubjectAccessRequest.url,
     {
      reqheaders: {
        "accept-encoding": 'gzip, deflate',
        "authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImRwcy1jbGllbnQta2V5In0.eyJzdWIiOiJwcmlzb25lci1vZmZlbmRlci1zZWFyY2gtY2xpZW50IiwiZ3JhbnRfdHlwZSI6ImNsaWVudF9jcmVkZW50aWFscyIsInNjb3BlIjpbInJlYWQiLCJ3cml0ZSJdLCJhdXRoX3NvdXJjZSI6Im5vbmUiLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjkwOTAvYXV0aC9pc3N1ZXIiLCJleHAiOjE3MDQ5OTg2MjQsImF1dGhvcml0aWVzIjpbIlJPTEVfU1lTVEVNX1VTRVIiLCJST0xFX1BSSVNPTkVSX0lOREVYIiwiUk9MRV9HTE9CQUxfU0VBUkNIIl0sImp0aSI6IjlzUTg5Z3Znb2FxUVRMNldhV2NKb3dRMks4TSIsImNsaWVudF9pZCI6InByaXNvbmVyLW9mZmVuZGVyLXNlYXJjaC1jbGllbnQifQ.JKI4icb5pmVHpdck4nQgeaqGWyMhcIxaqyN1HxhSL5A962FW03iCFgLZ5TLtEtVtmJ4UNDQquYlcghGvPGN2L7kUROyWcVpgpqTYNnqiEtPtJPk8P6e3oFC00BBoGNz8pQxsz-IgzOtJ7TRhcHnhgF6hnRHwLPzHrYCHnpz1zyKQVG2t32T8m0kitBwt-0YMMz8iA3GjhtfTHaiSVXpY8R5hEzZkbWIOMgIarUpDZwIYVbSE4uuNsQZ4hdcSuGVwGL7e8TxyRSyfYacP_KPVr9TdTQQbkDROxiaO8XSXnfYc4ubmu5fi3bzx6a1o8Owt_0DMYNDNmxGY5_ohhjLFZA",
        "content-type": "application/json",
        "content-length": '165'
      },
    })
      .persist()
      .post(
        '/api/createSubjectAccessRequest',
        '{"dateFrom": "01/01/2001", "dateTo": "25/12/2022", "sarCaseReferenceNumber": "mockedCaseReference", "services": "service1, .com", "nomisId": "16", "ndeliusCaseReferenceId": ""}',
      )
      .reply(200)
    console.log(test2)

    console.log(nock.activeMocks())

    const response = await SummaryController.postSARAPI(req, res)
    expect(response.status).toBe(400)
    expect(res.redirect).toHaveBeenCalled()
    expect(res.redirect).toBeCalledWith('/confirmation')
  })
})
