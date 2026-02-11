import type { Request, Response } from 'express'
import { auditService } from '@ministryofjustice/hmpps-audit-client'
import { AdminSubjectAccessRequest } from '../../@types/subjectAccessRequest'
import { auditAction } from '../../utils/testUtils'
import { AuditEvent } from '../../audit'
import AdminDetailsController from './adminDetailsController'
import reportService from '../../services/report'

const subjectAccessRequests: AdminSubjectAccessRequest[] = [
  {
    id: 'aaaaaaaa-cb77-4c0e-a4de-1efc0e86ff34',
    status: 'Pending',
    dateFrom: '2024-03-01',
    dateTo: '2024-03-12',
    sarCaseReferenceNumber: 'caseRef1',
    services: 'hmpps-activities-management-api, keyworker-api, hmpps-manage-adjudications-api',
    nomisId: 'A123456',
    ndeliusCaseReferenceId: 'X718253',
    requestedBy: 'user',
    requestDateTime: '2024-03-12T13:52:40.14177',
    claimDateTime: '2024-03-27T14:49:08.67033',
    claimAttempts: 1,
    objectUrl: '',
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
    nomisId: 'A123456',
    ndeliusCaseReferenceId: 'X718253',
    requestedBy: 'user',
    requestDateTime: '2023-03-12T13:52:40.14177',
    claimDateTime: '2023-03-27T14:49:08.67033',
    claimAttempts: 1,
    objectUrl: '',
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
    nomisId: 'A123456',
    ndeliusCaseReferenceId: 'X718253',
    requestedBy: 'user',
    requestDateTime: '2022-03-12T13:52:40.14177',
    claimDateTime: '2022-03-20T14:49:08.67033',
    claimAttempts: 1,
    objectUrl: '',
    lastDownloaded: '2022-03-23T18:22:38.13743',
    durationHumanReadable: '1d',
    appInsightsEventsUrl: 'appInsights',
  },
]
const countSummary = {
  totalCount: 10,
  completedCount: 5,
  erroredCount: 4,
  overdueCount: 3,
  pendingCount: 2,
}
const currentPage = '5'

beforeEach(() => {
  jest.resetAllMocks()
  jest.spyOn(auditService, 'sendAuditMessage').mockResolvedValue()
  reportService.restartSubjectAccessRequest = jest.fn().mockReturnValue({
    success: true,
  })
  reportService.getAdminSubjectAccessRequestDetails = jest.fn().mockReturnValue({
    subjectAccessRequests,
    numberOfReports: '3',
    countSummary,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('getAdminDetails', () => {
  const req: Request = {
    session: { subjectAccessRequests },
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
  const expectedSubjectAccessRequest = {
    id: 'cccccccc-cb77-4c0e-a4de-1efc0e86ff34',
    status: 'Completed',
    dateFrom: '1 March 2022',
    dateTo: '12 March 2022',
    sarCaseReferenceNumber: 'caseRef3',
    services: 'hmpps-activities-management-api, keyworker-api, hmpps-manage-adjudications-api',
    nomisId: 'A123456',
    ndeliusCaseReferenceId: 'X718253',
    objectUrl: '',
    requestedBy: 'user',
    requestDateTime: '12 March 2022 at 13:52:40 UTC',
    claimDateTime: '20 March 2022 at 14:49:08 UTC',
    claimAttempts: 1,
    lastDownloaded: '23 March 2022 at 18:22:38 UTC',
    durationHumanReadable: '1d',
    appInsightsEventsUrl: 'appInsights',
  }
  test('renders details of selected subject access request ', async () => {
    req.query.id = 'cccccccc-cb77-4c0e-a4de-1efc0e86ff34'

    await AdminDetailsController.getAdminDetail(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'pages/admin/adminDetails',
      expect.objectContaining({
        subjectAccessRequest: expectedSubjectAccessRequest,
        searchParamsString: '',
      }),
    )
    expect(auditService.sendAuditMessage).toHaveBeenCalledWith(auditAction(AuditEvent.VIEW_ADMIN_REPORT_DETAIL_ATTEMPT))
  })

  test.each([
    [
      { searchTerm: 'abc', completed: true, errored: true, overdue: true, pending: true },
      'keyword=abc&status=completed&status=errored&status=overdue&status=pending',
    ],
    [{ searchTerm: 'abc', completed: false, errored: false, overdue: false, pending: false }, 'keyword=abc'],
    [{ completed: false, errored: false, overdue: false, pending: false }, ''],
    [{ completed: true, errored: false, overdue: true, pending: false }, 'status=completed&status=overdue'],
    [{ searchTerm: 'abc' }, 'keyword=abc'],
  ])(
    'renders details of selected subject access request when session contains search filters "%s"',
    async (searchOptionsIn: SearchOptions, expectedSearchParams: string) => {
      req.query.id = 'cccccccc-cb77-4c0e-a4de-1efc0e86ff34'
      req.session.searchOptions = searchOptionsIn

      await AdminDetailsController.getAdminDetail(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'pages/admin/adminDetails',
        expect.objectContaining({
          subjectAccessRequest: expectedSubjectAccessRequest,
          searchParamsString: expectedSearchParams,
        }),
      )
      expect(auditService.sendAuditMessage).toHaveBeenCalledWith(
        auditAction(AuditEvent.VIEW_ADMIN_REPORT_DETAIL_ATTEMPT),
      )
    },
  )
})

describe('restartRequest', () => {
  const req: Request = {
    session: { subjectAccessRequests, currentPage },
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
  const expectedSubjectAccessRequest = {
    id: 'cccccccc-cb77-4c0e-a4de-1efc0e86ff34',
    status: 'Completed',
    dateFrom: '1 March 2022',
    dateTo: '12 March 2022',
    sarCaseReferenceNumber: 'caseRef3',
    services: 'hmpps-activities-management-api, keyworker-api, hmpps-manage-adjudications-api',
    nomisId: 'A123456',
    ndeliusCaseReferenceId: 'X718253',
    objectUrl: '',
    requestedBy: 'user',
    requestDateTime: '12 March 2022 at 13:52:40 UTC',
    claimDateTime: '20 March 2022 at 14:49:08 UTC',
    claimAttempts: 1,
    lastDownloaded: '23 March 2022 at 18:22:38 UTC',
    durationHumanReadable: '1d',
    appInsightsEventsUrl: 'appInsights',
  }
  test('restarts and re-renders details of selected subject access request ', async () => {
    req.query.id = 'cccccccc-cb77-4c0e-a4de-1efc0e86ff34'

    await AdminDetailsController.restartRequest(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'pages/admin/adminDetails',
      expect.objectContaining({
        subjectAccessRequest: expectedSubjectAccessRequest,
        searchParamsString: '',
        restartDetails: { success: true },
      }),
    )
    expect(auditService.sendAuditMessage).toHaveBeenCalledWith(auditAction(AuditEvent.RESTART_REPORT_ATTEMPT))
    expect(reportService.restartSubjectAccessRequest).toHaveBeenCalledWith(req, 'cccccccc-cb77-4c0e-a4de-1efc0e86ff34')
    expect(reportService.getAdminSubjectAccessRequestDetails).toHaveBeenCalledWith(req, undefined, currentPage, 50)
  })

  test.each([
    [
      { searchTerm: 'abc', completed: true, errored: true, overdue: true, pending: true },
      'keyword=abc&status=completed&status=errored&status=overdue&status=pending',
    ],
    [{ searchTerm: 'abc', completed: false, errored: false, overdue: false, pending: false }, 'keyword=abc'],
    [{ completed: false, errored: false, overdue: false, pending: false }, ''],
    [{ completed: true, errored: false, overdue: true, pending: false }, 'status=completed&status=overdue'],
    [{ searchTerm: 'abc' }, 'keyword=abc'],
  ])(
    'restarts and re-renders details of selected subject access request when session contains search filters "%s"',
    async (searchOptions: SearchOptions, expectedSearchParams: string) => {
      req.query.id = 'cccccccc-cb77-4c0e-a4de-1efc0e86ff34'
      req.session.searchOptions = searchOptions

      await AdminDetailsController.restartRequest(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'pages/admin/adminDetails',
        expect.objectContaining({
          subjectAccessRequest: expectedSubjectAccessRequest,
          searchParamsString: expectedSearchParams,
          restartDetails: { success: true },
        }),
      )
      expect(auditService.sendAuditMessage).toHaveBeenCalledWith(auditAction(AuditEvent.RESTART_REPORT_ATTEMPT))
      expect(reportService.restartSubjectAccessRequest).toHaveBeenCalledWith(
        req,
        'cccccccc-cb77-4c0e-a4de-1efc0e86ff34',
      )
      expect(reportService.getAdminSubjectAccessRequestDetails).toHaveBeenCalledWith(
        req,
        searchOptions,
        currentPage,
        50,
      )
    },
  )
})
