import type { Request, Response } from 'express'
import { auditService } from '@ministryofjustice/hmpps-audit-client'
import type { AdminSubjectAccessRequest } from '../../@types/subjectAccessRequest'
import { auditAction } from '../../utils/testUtils'
import { AuditEvent } from '../../audit'
import AdminReportsController from './adminReportsController'
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
    ndeliusCaseReferenceId: 'X718253',
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
    nomisId: 'A123456',
    ndeliusCaseReferenceId: '',
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
const countSummary = {
  totalCount: 10,
  completedCount: 5,
  erroredCount: 4,
  overdueCount: 3,
  pendingCount: 2,
}

beforeEach(() => {
  jest.resetAllMocks()
  jest.spyOn(auditService, 'sendAuditMessage').mockResolvedValue()
  reportService.getAdminSubjectAccessRequestDetails = jest.fn().mockReturnValue({
    subjectAccessRequests,
    numberOfReports: '3',
    countSummary,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('getAdminSummary', () => {
  let req: Request = {
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
  test.each([
    [
      { keyword: '123abc', status: ['completed', 'errored', 'overdue', 'pending'] },
      { searchTerm: '123abc', completed: true, errored: true, overdue: true, pending: true },
    ],
    [
      { keyword: '', status: ['completed', 'errored', 'overdue', 'pending'] },
      { searchTerm: '', completed: true, errored: true, overdue: true, pending: true },
    ],
    [
      { keyword: '123abc', status: ['errored', 'pending'] },
      { searchTerm: '123abc', completed: false, errored: true, overdue: false, pending: true },
    ],
    [{ status: ['errored'] }, { searchTerm: '', completed: false, errored: true, overdue: false, pending: false }],
    [{ keyword: '123abc' }, { searchTerm: '123abc', completed: false, errored: false, overdue: false, pending: false }],
    [{}, { searchTerm: '', completed: false, errored: false, overdue: false, pending: false }],
  ])(
    'renders a response with list of SAR reports when query params "%s" supplied',
    async (queryParams, expectedSearchOptions: SearchOptions) => {
      req.query = queryParams
      await AdminReportsController.getAdminSummary(req, res)
      expect(res.render).toHaveBeenCalledWith(
        'pages/admin/adminReports',
        expect.objectContaining({
          reportList: [
            {
              uuid: 'aaaaaaaa-cb77-4c0e-a4de-1efc0e86ff34',
              status: 'Pending',
              sarCaseReference: 'caseRef1',
              subjectId: 'A123456',
              dateOfRequest: '12/03/2024, 13:52',
              durationHumanReadable: '1d',
              appInsightsEventsUrl: 'appInsights',
            },
            {
              uuid: 'bbbbbbbb-cb77-4c0e-a4de-1efc0e86ff34',
              status: 'Completed',
              sarCaseReference: 'caseRef2',
              subjectId: 'X718253',
              dateOfRequest: '12/03/2023, 13:52',
              durationHumanReadable: '1d',
              appInsightsEventsUrl: 'appInsights',
            },
            {
              uuid: 'cccccccc-cb77-4c0e-a4de-1efc0e86ff34',
              status: 'Completed',
              sarCaseReference: 'caseRef3',
              subjectId: 'A123456',
              dateOfRequest: '12/03/2022, 13:52',
              durationHumanReadable: '1d',
              appInsightsEventsUrl: 'appInsights',
            },
          ],
          searchOptions: expectedSearchOptions,
          countSummary,
        }),
      )
      expect(req.session.subjectAccessRequests).toEqual(subjectAccessRequests)
      expect(req.session.currentPage).toEqual('1')
      expect(auditService.sendAuditMessage).toHaveBeenCalledWith(auditAction(AuditEvent.VIEW_ADMIN_REPORTS_ATTEMPT))
    },
  )

  describe('pagination', () => {
    beforeEach(() => {
      reportService.getAdminSubjectAccessRequestDetails = jest.fn().mockReturnValue({
        subjectAccessRequests: [],
        numberOfReports: 240,
      })
    })
    test('when the current page is the first page', async () => {
      await AdminReportsController.getAdminSummary(req, res)
      expect(res.render).toHaveBeenCalledWith(
        'pages/admin/adminReports',
        expect.objectContaining({
          previous: 0,
          next: 2,
          from: 1,
          to: 50,
          numberOfReports: 240,
        }),
      )
    })

    test('when the current page is the fifth page', async () => {
      req = {
        session: {},
        query: { page: '5' },
      } as unknown as Request
      await AdminReportsController.getAdminSummary(req, res)
      expect(res.render).toHaveBeenCalledWith(
        'pages/admin/adminReports',
        expect.objectContaining({
          previous: 4,
          next: 0,
          from: 201,
          to: 240,
          numberOfReports: 240,
        }),
      )
    })

    test('when the current page is the third page', async () => {
      req = {
        session: {},
        query: { page: '3', id: 'df936446-719a-4463-acb6-9b13eea1f495' },
        user: {
          token: 'fakeUserToken',
          authSource: 'auth',
        },
      } as unknown as Request
      await AdminReportsController.getAdminSummary(req, res)
      expect(res.render).toHaveBeenCalledWith(
        'pages/admin/adminReports',
        expect.objectContaining({
          previous: 2,
          next: 4,
          from: 101,
          to: 150,
          numberOfReports: 240,
        }),
      )
    })
  })

  describe('getSarSummaryList', () => {
    test('getSarSummaryList returns list of SARs with summary information for display', async () => {
      const condensedSarList = [
        {
          uuid: 'aaaaaaaa-cb77-4c0e-a4de-1efc0e86ff34',
          status: 'Pending',
          sarCaseReference: 'caseRef1',
          subjectId: 'A123456',
          dateOfRequest: '12/03/2024, 13:52',
          durationHumanReadable: '1d',
          appInsightsEventsUrl: 'appInsights',
        },
        {
          uuid: 'bbbbbbbb-cb77-4c0e-a4de-1efc0e86ff34',
          status: 'Completed',
          sarCaseReference: 'caseRef2',
          subjectId: 'X718253',
          dateOfRequest: '12/03/2023, 13:52',
          durationHumanReadable: '1d',
          appInsightsEventsUrl: 'appInsights',
        },
        {
          uuid: 'cccccccc-cb77-4c0e-a4de-1efc0e86ff34',
          status: 'Completed',
          sarCaseReference: 'caseRef3',
          subjectId: 'A123456',
          dateOfRequest: '12/03/2022, 13:52',
          durationHumanReadable: '1d',
          appInsightsEventsUrl: 'appInsights',
        },
      ]

      const response = AdminReportsController.getSarSummaryList(subjectAccessRequests)

      expect(response).toStrictEqual(condensedSarList)
    })
  })
})
