import type { Request, Response } from 'express'
import { auditService } from '@ministryofjustice/hmpps-audit-client'
import type { SubjectAccessRequest } from '../@types/subjectAccessRequest'
import { auditAction } from '../utils/testUtils'
import { AuditEvent } from '../audit'
import AdminDetailsController from './adminDetailsController'

const subjectAccessRequests: SubjectAccessRequest[] = [
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
    objectUrl: null,
    lastDownloaded: null,
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
    objectUrl: null,
    lastDownloaded: '2022-03-23T18:22:38.13743',
  },
]

beforeEach(() => {
  jest.resetAllMocks()
  jest.spyOn(auditService, 'sendAuditMessage').mockResolvedValue()
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
  test('renders details of selected subject access request ', async () => {
    req.query.id = 'cccccccc-cb77-4c0e-a4de-1efc0e86ff34'

    await AdminDetailsController.getAdminDetail(req, res)
    expect(res.render).toHaveBeenCalledWith(
      'pages/adminDetails',
      expect.objectContaining({
        subjectAccessRequest: {
          id: 'cccccccc-cb77-4c0e-a4de-1efc0e86ff34',
          status: 'Completed',
          dateFrom: '1 March 2022',
          dateTo: '12 March 2022',
          sarCaseReferenceNumber: 'caseRef3',
          services: 'hmpps-activities-management-api, keyworker-api, hmpps-manage-adjudications-api',
          nomisId: 'A123456',
          ndeliusCaseReferenceId: 'X718253',
          objectUrl: null,
          requestedBy: 'user',
          requestDateTime: '12 March 2022 at 13:52:40 UTC',
          claimDateTime: '20 March 2022 at 14:49:08 UTC',
          claimAttempts: 1,
          lastDownloaded: '23 March 2022 at 18:22:38 UTC',
        },
      }),
    )
    expect(auditService.sendAuditMessage).toHaveBeenCalledWith(auditAction(AuditEvent.VIEW_ADMIN_DETAIL_ATTEMPT))
  })
})
