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
        selectedList: [{ id: '1', text: 'service1' }],
      },
      body: { selectedservices: [] },
    }

    // const test = fakeApi.post('/api/createSubjectAccessRequest', {body: '{"dateFrom": "01/01/2001", "dateTo": "25/12/2022", "sarCaseReferenceNumber": "mockedCaseReference", "services": "service1, undefined", "nomisId": "16", "ndeliusCaseReferenceId": ""}'}, {reqheaders: {
    //   authorization: 'Bearer /.*/',
    // }}).reply(400)
    // console.log(test)

    const test2 = nock(config.apis.createSubjectAccessRequest.url, {
      reqheaders: {
        'accept-encoding': 'gzip, deflate',
        'content-length': '170',
        authorization:
          'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImRwcy1jbGllbnQta2V5In0.eyJzdWIiOiJwcmlzb25lci1vZmZlbmRlci1zZWFyY2gtY2xpZW50IiwiZ3JhbnRfdHlwZSI6ImNsaWVudF9jcmVkZW50aWFscyIsInNjb3BlIjpbInJlYWQiLCJ3cml0ZSJdLCJhdXRoX3NvdXJjZSI6Im5vbmUiLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjkwOTAvYXV0aC9pc3N1ZXIiLCJleHAiOjE3MDQ5OTMzMTAsImF1dGhvcml0aWVzIjpbIlJPTEVfU1lTVEVNX1VTRVIiLCJST0xFX1BSSVNPTkVSX0lOREVYIiwiUk9MRV9HTE9CQUxfU0VBUkNIIl0sImp0aSI6IlNuVU1UMThZUEhMSjlzS0hZZURNMVk2YkQzYyIsImNsaWVudF9pZCI6InByaXNvbmVyLW9mZmVuZGVyLXNlYXJjaC1jbGllbnQifQ.Ae6W_sVhRiW-cjekBDq7Uz5fCYKzAnvTf_d-Fi8jfLPkJv7FHgrfwITp5BsbfWKQX_6t2Tr_dlP0s9q2_OmB4S9-DPx_2zKSrC94glduQJQKx0G16x2G3FhDWiCzPapscwJTo7Ncrqk0t3IiVDfwqDtx8yMHrR3ATNjXnlL7DjYF64tPO2V7YYGVp9PurUwn0n-0Yg0HDFga97-I_6vOwytemlTgiKNYpC32gd8OFJkGLBwYu8MOckCF3pq4LhYAm1mtGZH5QmaXqQWS6SHNlwA-qb87D_DhTaGWPJt4ELjX5gqn0_yhh3kCTDtfKSulRgtBQ7zJdqnhALOA-GjLwg',
        'content-type': 'application/json',
      },
    })
      .persist()
      .post(
        '/api/createSubjectAccessRequest',
        '{"dateFrom": "01/01/2001", "dateTo": "25/12/2022", "sarCaseReferenceNumber": "mockedCaseReference", "services": "service1, undefined", "nomisId": "16", "ndeliusCaseReferenceId": ""}',
      )
      .reply(400)
    // console.log(test2)

    console.log(nock.activeMocks())

    const response = await SummaryController.postSARAPI(req, res)
    expect(response.status).toBe(400)
    // expect(response.text).toBe('')
    expect(res.redirect).toHaveBeenCalled()
    expect(res.redirect).toBeCalledWith('/confirmation')
  })
})
