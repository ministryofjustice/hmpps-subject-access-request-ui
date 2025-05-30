import { NextFunction, type Request, type Response } from 'express'
import proxy from 'express-http-proxy'
import nock from 'nock'
import config from '../config'
import reportService from './report'
import type { AdminSubjectAccessRequest } from '../@types/subjectAccessRequest'

jest.mock('express-http-proxy')
const Proxy = proxy as jest.Mock
jest.mock('../utils/paginationHelper', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue([
    {
      href: 'reports?page=1',
    },
  ]),
}))

const apiUrl = config.apis.subjectAccessRequest.url

let fakeApi: nock.Scope

const subjectAccessRequests: AdminSubjectAccessRequest[] = [
  {
    id: 'aaaaaaaa-cb77-4c0e-a4de-1efc0e86ff34',
    status: 'Pending',
    dateFrom: '2024-03-01',
    dateTo: '2024-03-12',
    sarCaseReferenceNumber: 'caseRef1',
    services: 'hmpps-activities-management-api, keyworker-api, hmpps-manage-adjudications-api',
    nomisId: '',
    ndeliusCaseReferenceId: 'A123456',
    requestedBy: 'user',
    requestDateTime: '2024-03-12T13:52:40.14177',
    claimDateTime: '2024-03-27T14:49:08.67033',
    claimAttempts: 1,
    objectUrl: null,
    lastDownloaded: null,
    durationHumanReadable: '1d',
    appInsightsEventsUrl: 'appInsights',
  },
  {
    id: 'bbbbbbbb-cb77-4c0e-a4de-1efc0e86ff34',
    status: 'Completed',
    dateFrom: '2023-03-01',
    dateTo: '2023-03-12',
    sarCaseReferenceNumber: 'caseRef2',
    services: 'hmpps-activities-management-api, keyworker-api, hmpps-manage-adjudications-api',
    nomisId: '',
    ndeliusCaseReferenceId: 'A123456',
    requestedBy: 'user',
    requestDateTime: '2023-03-12T13:52:40.14177',
    claimDateTime: '2023-03-27T14:49:08.67033',
    claimAttempts: 1,
    objectUrl: null,
    lastDownloaded: null,
    durationHumanReadable: '1d',
    appInsightsEventsUrl: 'appInsights',
  },
  {
    id: 'cccccccc-cb77-4c0e-a4de-1efc0e86ff34',
    status: 'Completed',
    dateFrom: '2022-03-01',
    dateTo: '2022-03-12',
    sarCaseReferenceNumber: 'caseRef3',
    services: 'hmpps-activities-management-api, keyworker-api, hmpps-manage-adjudications-api',
    nomisId: '',
    ndeliusCaseReferenceId: 'A123456',
    requestedBy: 'user',
    requestDateTime: '2022-03-12T13:52:40.14177',
    claimDateTime: '2022-03-27T14:49:08.67033',
    claimAttempts: 1,
    objectUrl: null,
    lastDownloaded: null,
    durationHumanReadable: '1d',
    appInsightsEventsUrl: 'appInsights',
  },
]

const req: Request = {
  session: {},
  query: {},
  user: {
    token: 'fakeUserToken',
    authSource: 'auth',
    username: 'username',
  },
} as unknown as Request

beforeEach(() => {
  fakeApi = nock(config.apis.subjectAccessRequest.url)
})

afterEach(() => {
  nock.cleanAll()
})

describe('report', () => {
  describe('getReport', () => {
    it('should download a file', async () => {
      const mockReq = {}
      const mockRes = {}
      const mockNext = () => {}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-shadow
      Proxy.mockImplementationOnce((url: string, config: any) => {
        expect(url).toBe(apiUrl)
        expect(config.proxyReqPathResolver()).toBe('/api/report?id=fileId')
        return (myReq: Request, myRes: Response, myNext: NextFunction) => {
          expect(myReq).toBe(mockReq)
          expect(myRes).toBe(mockRes)
          expect(myNext).toBe(mockNext)
        }
      })
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      reportService.getReport(mockReq, mockRes, mockNext, 'fileId')
    })
  })

  describe('getSubjectAccessRequestList', () => {
    test('getSubjectAccessRequestList gets correct response', async () => {
      fakeApi.get('/api/subjectAccessRequests?pageSize=50&pageNumber=0&search=').reply(200, subjectAccessRequests)
      fakeApi.get('/api/totalSubjectAccessRequests?search=').reply(200, '3')

      const response = await reportService.getSubjectAccessRequestList(req, '1', 50)

      expect(response.subjectAccessRequests).toEqual(subjectAccessRequests)
      expect(response.numberOfReports).toEqual('3')
    })
  })

  describe('getAdminSubjectAccessRequestDetails', () => {
    test('getAdminSubjectAccessRequestDetails gets correct response', async () => {
      fakeApi
        .get(
          '/api/admin/subjectAccessRequests?completed=true&errored=true&overdue=false&pending=true&pageSize=50&pageNumber=0&search=123abd',
        )
        .reply(200, {
          requests: subjectAccessRequests,
          filterCount: 3,
          totalCount: 10,
          completedCount: 6,
          erroredCount: 7,
          overdueCount: 8,
          pendingCount: 9,
        })
      fakeApi.get('/api/totalSubjectAccessRequests?search=').reply(200, '3')
      const searchOptions = { searchTerm: '123abd', completed: true, errored: true, overdue: false, pending: true }

      const response = await reportService.getAdminSubjectAccessRequestDetails(req, searchOptions, '1', 50)

      expect(response.subjectAccessRequests).toEqual(subjectAccessRequests)
      expect(response.numberOfReports).toEqual(3)
      expect(response.countSummary).toEqual({
        totalCount: 10,
        completedCount: 6,
        erroredCount: 7,
        overdueCount: 8,
        pendingCount: 9,
      })
    })
  })

  describe('report pagination', () => {
    const pageLinks = [
      {
        href: 'reports?page=1',
      },
    ]

    test('when the current page is the first page', () => {
      const paginationInformation = reportService.getPaginationInformation('240', '1', '', 50)
      expect(paginationInformation).toEqual({
        pageLinks,
        previous: 0,
        next: 2,
        from: 1,
        to: 50,
      })
    })

    describe('when the current page is the last page', () => {
      const paginationInformation = reportService.getPaginationInformation('240', '5', '', 50)
      expect(paginationInformation).toEqual({
        pageLinks,
        previous: 4,
        next: 0,
        from: 201,
        to: 240,
      })
    })

    describe('when the current page is a middle page', () => {
      const paginationInformation = reportService.getPaginationInformation('240', '3', '', 50)
      expect(paginationInformation).toEqual({
        pageLinks,
        previous: 2,
        next: 4,
        from: 101,
        to: 150,
      })
    })
  })

  describe('restartSubjectAccessRequest', () => {
    const sarId = 'aaaaaaaa-cb77-4c0e-a4de-1efc0e86ff34'

    test('restartSubjectAccessRequest calls restart successfully', async () => {
      fakeApi.patch(`/api/admin/subjectAccessRequests/${sarId}/restart`).reply(200)

      const response = await reportService.restartSubjectAccessRequest(req, sarId)

      expect(response).toEqual({ success: true })
    })

    test('restartSubjectAccessRequest calls restart with response error', async () => {
      fakeApi
        .patch(`/api/admin/subjectAccessRequests/${sarId}/restart`)
        .reply(400, { userMessage: 'some error message' })

      const response = await reportService.restartSubjectAccessRequest(req, sarId)

      expect(response).toEqual({ success: false, message: 'some error message' })
    })
  })
})
