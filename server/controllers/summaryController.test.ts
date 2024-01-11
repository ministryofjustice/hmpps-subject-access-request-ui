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

    nock(config.apis.createSubjectAccessRequest.url)
      .post(
        '/api/createSubjectAccessRequest',
        '{"dateFrom":"01/01/2001","dateTo":"25/12/2022","sarCaseReferenceNumber":"mockedCaseReference","services":"service1, .com","nomisId":"16","ndeliusCaseReferenceId":""}',
      )
      .reply(200)

    const response = await SummaryController.postSARAPI(req, res)
    expect(response.status).toBe(200)
    expect(res.redirect).toHaveBeenCalled()
    expect(res.redirect).toBeCalledWith('/confirmation')
  })
})
