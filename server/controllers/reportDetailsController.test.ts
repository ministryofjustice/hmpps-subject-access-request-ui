import type { Request, Response } from 'express'
import { SubjectAccessRequest } from '../@types/subjectAccessRequest'
import ReportDetailsController from './reportDetailsController'
import reportService from '../services/report'
import productConfigsService from '../services/productConfigurations'

const subjectAccessRequest: SubjectAccessRequest = {
  id: 'cccccccc-cb77-4c0e-a4de-1efc0e86ff34',
  status: 'Completed',
  dateFrom: '2022-03-01',
  dateTo: '2022-03-12',
  sarCaseReferenceNumber: 'caseRef3',
  services: [
    { serviceName: 'hmpps-activities-management-api', serviceLabel: 'Activities', renderStatus: 'PENDING' },
    { serviceName: 'keyworker-api', serviceLabel: 'Keyworker', renderStatus: 'PENDING' },
    { serviceName: 'hmpps-manage-adjudications-api', serviceLabel: 'Adjudications', renderStatus: 'PENDING' },
  ],
  nomisId: 'A123456',
  ndeliusCaseReferenceId: 'X718253',
  requestedBy: 'user',
  requestDateTime: '2022-03-12T13:52:40.14177',
  claimDateTime: '2022-03-20T14:49:08.67033',
  claimAttempts: 1,
  objectUrl: '',
  lastDownloaded: '2022-03-23T18:22:38.13743',
}
const sarId = 'cccccccc-cb77-4c0e-a4de-1efc0e86ff34'
const productConfigurationList = [
  {
    id: 'e46c70cd-a2c3-4692-8a95-95905f06d4bf',
    name: 'hmpps-prisoner-search',
    label: 'Prisoner Search',
    url: 'https://prisoner-search-dev.prison.service.justice.gov.uk',
    enabled: true,
    category: 'PRISON',
    suspended: false,
    suspendedAt: '',
  },
  {
    id: '76fd9b66-2e57-41f0-8084-e0c6e2660e2c',
    name: 'hmpps-book-secure-move-api',
    label: 'Book Secure Move API',
    url: 'https://book-move-dev.prison.service.justice.gov.uk',
    enabled: true,
    category: 'PRISON',
    suspended: true,
    suspendedAt: null,
  },
  {
    id: 'd48a72c7-a8fa-4803-a83d-8c1f2b934273',
    name: 'hmpps-approved-premises-api',
    label: 'Community accommodation services',
    url: 'https://approved-premises-api-dev.hmpps.service.justice.gov.uk',
    enabled: true,
    category: 'PROBATION',
    suspended: false,
    suspendedAt: null,
  },
]

beforeEach(() => {
  jest.resetAllMocks()
  reportService.getSubjectAccessRequestFormatted = jest.fn().mockReturnValue(subjectAccessRequest)
  productConfigsService.getProductList = jest.fn().mockReturnValue(productConfigurationList)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('getReportDetails', () => {
  const req: Request = {
    session: {},
    query: {},
    user: {
      token: 'fakeUserToken',
      authSource: 'auth',
      username: 'username',
    },
  } as unknown as Request
  const res: Response = {
    render: jest.fn(),
    set: jest.fn(),
    send: jest.fn(),
    locals: {
      user: {
        token: 'fakeUserToken',
        authSource: 'auth',
        username: 'username',
      },
    },
  } as unknown as Response
  test('renders details of selected subject access request', async () => {
    req.query.id = sarId

    await ReportDetailsController.getReportDetails(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'pages/reportDetails',
      expect.objectContaining({
        subjectAccessRequest,
        searchParamsString: '',
        suspendedProductsList: [productConfigurationList[1]],
      }),
    )
    expect(reportService.getSubjectAccessRequestFormatted).toHaveBeenCalledWith(req, sarId)
  })

  test('renders details of selected subject access request when session contains search filter', async () => {
    req.query.id = sarId
    req.session.searchOptions = { searchTerm: 'abc' }

    await ReportDetailsController.getReportDetails(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'pages/reportDetails',
      expect.objectContaining({
        subjectAccessRequest,
        searchParamsString: 'keyword=abc',
        suspendedProductsList: [productConfigurationList[1]],
      }),
    )
    expect(reportService.getSubjectAccessRequestFormatted).toHaveBeenCalledWith(req, sarId)
  })
})
