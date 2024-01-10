import { type Request, type Response } from 'express'
import SummaryController from './summaryController'

afterEach(() => {
  jest.resetAllMocks()
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
    await SummaryController.getReportDetails(req, res)
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

  test('post request made to SAR endpoint on clicking confirm', async () => {
    const req: Request = {
      // @ts-expect-error stubbing session
      session: {
        serviceList: [],
        userData: {
          dateFrom: '01/01/2001',
          dateTo: '25/12/2022',
          caseReference: 'mockedCaseReference',
        },
        selectedList: [{ id: '1', text: 'service1' }],
      },
      body: { selectedservices: [] },
    }

    // '{ "dateFrom": "01/12/2023",
    // "dateTo": "03/01/2024",
    // "sarCaseReferenceNumber": "1234abc",
    // "services": "1,2,4",
    // "nomisId": "",
    // "ndeliusCaseReferenceId": "" }

    // const token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImRwcy1jbGllbnQta2V5In0.eyJzdWIiOiJwcmlzb25lci1vZmZlbmRlci1zZWFyY2gtY2xpZW50IiwiZ3JhbnRfdHlwZSI6ImNsaWVudF9jcmVkZW50aWFscyIsInNjb3BlIjpbInJlYWQiLCJ3cml0ZSJdLCJhdXRoX3NvdXJjZSI6Im5vbmUiLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjkwOTAvYXV0aC9pc3N1ZXIiLCJleHAiOjE3MDQ4ODcyNTIsImF1dGhvcml0aWVzIjpbIlJPTEVfU1lTVEVNX1VTRVIiLCJST0xFX1BSSVNPTkVSX0lOREVYIiwiUk9MRV9HTE9CQUxfU0VBUkNIIl0sImp0aSI6Ilhvbk1QMjhGTzUwNUtOQzMzN3RfdWlhMDkzVSIsImNsaWVudF9pZCI6InByaXNvbmVyLW9mZmVuZGVyLXNlYXJjaC1jbGllbnQifQ.n5YaTz5W8-RhhfZof7gMLqM644ifAWC0e96EJ6IDM17iosX_UF4OHAFuC2Puw7UEYPYcmVMedBlTLLJrCLG7fN4wfTSldhQOLYO-aDl4nT5JKzptTkWV1KrJsAA9TZO4VIy3DJyYfPluMWq6mf5rjRiy_ud5rsUh5_lXGQPwq532yUXqPbgxDdHDMLVVwj6WNUQUXlpBub7qXXMIRYE-v9d27_kRxnhb7sJdBCk8Fpyx4duNozU9bQCX7Vq1YPqCo-_tFP6Gnoc7rJu24Y3UnCJGjJiAorN_Mgickd5qhXcboJa1TT8nFgN8QWNYG4R9AauUXKfkF43pnkygkeeOQA"
    const response = await SummaryController.postSARAPI(req, res)
    expect(response.status).toBe(200)
    expect(response.text).toBe('')
    expect(res.render).toHaveBeenCalled()
    expect(res.render).toBeCalledWith('pages/summary')
  })
})
