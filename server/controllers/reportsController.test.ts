import type { Request, Response } from 'express'
import { auditService } from '@ministryofjustice/hmpps-audit-client'
import ReportsController from './reportsController'
import type { SubjectAccessRequest } from '../@types/subjectAccessRequest'
import { auditAction } from '../utils/testUtils'
import { AuditEvent } from '../audit'
import reportService from '../services/report'

const subjectAccessRequests: SubjectAccessRequest[] = [
  {
    id: 'aaaaaaaa-cb77-4c0e-a4de-1efc0e86ff34',
    status: 'Pending',
    dateFrom: '2024-03-01',
    dateTo: '2024-03-12',
    sarCaseReferenceNumber: 'caseRef1',
    services:
      'hmpps-activities-management-api, https://activities-api-dev.prison.service.justice.gov.uk,keyworker-api, https://keyworker-api-dev.prison.service.justice.gov.uk,hmpps-manage-adjudications-api, https://manage-adjudications-api-dev.hmpps.service.justice.gov.uk',
    nomisId: '',
    ndeliusCaseReferenceId: 'A123456',
    requestedBy: 'user',
    requestDateTime: '2024-03-12T13:52:40.14177',
    claimDateTime: '2024-03-27T14:49:08.67033',
    claimAttempts: 1,
    objectUrl: null,
    lastDownloaded: null,
  },
  {
    id: 'bbbbbbbb-cb77-4c0e-a4de-1efc0e86ff34',
    status: 'Completed',
    dateFrom: '2023-03-01',
    dateTo: '2023-03-12',
    sarCaseReferenceNumber: 'caseRef2',
    services:
      'hmpps-activities-management-api, https://activities-api-dev.prison.service.justice.gov.uk,keyworker-api, https://keyworker-api-dev.prison.service.justice.gov.uk,hmpps-manage-adjudications-api, https://manage-adjudications-api-dev.hmpps.service.justice.gov.uk',
    nomisId: '',
    ndeliusCaseReferenceId: 'A123456',
    requestedBy: 'user',
    requestDateTime: '2023-03-12T13:52:40.14177',
    claimDateTime: '2023-03-27T14:49:08.67033',
    claimAttempts: 1,
    objectUrl: null,
    lastDownloaded: null,
  },
  {
    id: 'cccccccc-cb77-4c0e-a4de-1efc0e86ff34',
    status: 'Completed',
    dateFrom: '2022-03-01',
    dateTo: '2022-03-12',
    sarCaseReferenceNumber: 'caseRef3',
    services:
      'hmpps-activities-management-api, https://activities-api-dev.prison.service.justice.gov.uk,keyworker-api, https://keyworker-api-dev.prison.service.justice.gov.uk,hmpps-manage-adjudications-api, https://manage-adjudications-api-dev.hmpps.service.justice.gov.uk',
    nomisId: '',
    ndeliusCaseReferenceId: 'A123456',
    requestedBy: 'user',
    requestDateTime: '2022-03-12T13:52:40.14177',
    claimDateTime: '2022-03-27T14:49:08.67033',
    claimAttempts: 1,
    objectUrl: null,
    lastDownloaded: null,
  },
]

beforeEach(() => {
  jest.resetAllMocks()
  jest.spyOn(auditService, 'sendAuditMessage').mockResolvedValue()
  reportService.getSubjectAccessRequestList = jest.fn().mockReturnValue({
    subjectAccessRequests,
    numberOfReports: 3,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('getReports', () => {
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
  test('renders a response with list of SAR reports', async () => {
    await ReportsController.getReports(req, res)
    expect(res.render).toHaveBeenCalledWith(
      'pages/reports',
      expect.objectContaining({
        reportList: [
          {
            uuid: 'aaaaaaaa-cb77-4c0e-a4de-1efc0e86ff34',
            status: 'Pending',
            sarCaseReference: 'caseRef1',
            subjectId: 'A123456',
            dateOfRequest: '2024-03-12T13:52:40.14177',
            lastDownloaded: '',
          },
          {
            uuid: 'bbbbbbbb-cb77-4c0e-a4de-1efc0e86ff34',
            status: 'Completed',
            sarCaseReference: 'caseRef2',
            subjectId: 'A123456',
            dateOfRequest: '2023-03-12T13:52:40.14177',
            lastDownloaded: '',
          },
          {
            uuid: 'cccccccc-cb77-4c0e-a4de-1efc0e86ff34',
            status: 'Completed',
            sarCaseReference: 'caseRef3',
            subjectId: 'A123456',
            dateOfRequest: '2022-03-12T13:52:40.14177',
            lastDownloaded: '',
          },
        ],
      }),
    )
    expect(auditService.sendAuditMessage).toHaveBeenCalledWith(auditAction(AuditEvent.VIEW_REPORT_LIST_ATTEMPT))
  })

  describe('pagination', () => {
    beforeEach(() => {
      reportService.getSubjectAccessRequestList = jest.fn().mockReturnValue({
        subjectAccessRequests: [],
        numberOfReports: 240,
      })
    })
    test('when the current page is the first page', async () => {
      await ReportsController.getReports(req, res)
      expect(res.render).toHaveBeenCalledWith(
        'pages/reports',
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
      await ReportsController.getReports(req, res)
      expect(res.render).toHaveBeenCalledWith(
        'pages/reports',
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
      await ReportsController.getReports(req, res)
      expect(res.render).toHaveBeenCalledWith(
        'pages/reports',
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

  describe('getCondensedSarList', () => {
    test('getCondensedSarList returns list of SARs with condensed information for display', async () => {
      const condensedSarList = [
        {
          uuid: 'aaaaaaaa-cb77-4c0e-a4de-1efc0e86ff34',
          status: 'Pending',
          sarCaseReference: 'caseRef1',
          subjectId: 'A123456',
          dateOfRequest: '2024-03-12T13:52:40.14177',
          lastDownloaded: '',
        },
        {
          uuid: 'bbbbbbbb-cb77-4c0e-a4de-1efc0e86ff34',
          status: 'Completed',
          sarCaseReference: 'caseRef2',
          subjectId: 'A123456',
          dateOfRequest: '2023-03-12T13:52:40.14177',
          lastDownloaded: '',
        },
        {
          uuid: 'cccccccc-cb77-4c0e-a4de-1efc0e86ff34',
          status: 'Completed',
          sarCaseReference: 'caseRef3',
          subjectId: 'A123456',
          dateOfRequest: '2022-03-12T13:52:40.14177',
          lastDownloaded: '',
        },
      ]

      const response = ReportsController.getCondensedSarList(subjectAccessRequests)

      expect(response).toStrictEqual(condensedSarList)
    })
  })
})
