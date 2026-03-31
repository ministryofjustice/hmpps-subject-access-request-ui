import type { Request, Response } from 'express'
import { auditService } from '@ministryofjustice/hmpps-audit-client'
import { SubjectAccessRequest } from '../../@types/subjectAccessRequest'
import { auditAction } from '../../utils/testUtils'
import { AuditEvent } from '../../audit'
import AdminDetailsController from './adminDetailsController'
import reportService from '../../services/report'

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

beforeEach(() => {
  jest.resetAllMocks()
  jest.spyOn(auditService, 'sendAuditMessage').mockResolvedValue()
  reportService.restartSubjectAccessRequest = jest.fn().mockReturnValue({
    success: true,
  })
  reportService.getSubjectAccessRequestFormatted = jest.fn().mockReturnValue(subjectAccessRequest)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('getAdminDetails', () => {
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
  test('renders details of selected subject access request ', async () => {
    req.query.id = sarId

    await AdminDetailsController.getAdminDetail(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'pages/admin/adminDetails',
      expect.objectContaining({ subjectAccessRequest, searchParamsString: '' }),
    )
    expect(reportService.getSubjectAccessRequestFormatted).toHaveBeenCalledWith(req, sarId)
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
      req.query.id = sarId
      req.session.searchOptions = searchOptionsIn

      await AdminDetailsController.getAdminDetail(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'pages/admin/adminDetails',
        expect.objectContaining({ subjectAccessRequest, searchParamsString: expectedSearchParams }),
      )
      expect(reportService.getSubjectAccessRequestFormatted).toHaveBeenCalledWith(req, sarId)
      expect(auditService.sendAuditMessage).toHaveBeenCalledWith(
        auditAction(AuditEvent.VIEW_ADMIN_REPORT_DETAIL_ATTEMPT),
      )
    },
  )
})

describe('restartRequest', () => {
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
  test('restarts and re-renders details of selected subject access request ', async () => {
    req.query.id = sarId

    await AdminDetailsController.restartRequest(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'pages/admin/adminDetails',
      expect.objectContaining({ subjectAccessRequest, searchParamsString: '', restartDetails: { success: true } }),
    )
    expect(auditService.sendAuditMessage).toHaveBeenCalledWith(auditAction(AuditEvent.RESTART_REPORT_ATTEMPT))
    expect(reportService.restartSubjectAccessRequest).toHaveBeenCalledWith(req, sarId)
    expect(reportService.getSubjectAccessRequestFormatted).toHaveBeenCalledWith(req, sarId)
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
      req.query.id = sarId
      req.session.searchOptions = searchOptions

      await AdminDetailsController.restartRequest(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'pages/admin/adminDetails',
        expect.objectContaining({
          subjectAccessRequest,
          searchParamsString: expectedSearchParams,
          restartDetails: { success: true },
        }),
      )
      expect(auditService.sendAuditMessage).toHaveBeenCalledWith(auditAction(AuditEvent.RESTART_REPORT_ATTEMPT))
      expect(reportService.restartSubjectAccessRequest).toHaveBeenCalledWith(req, sarId)
      expect(reportService.getSubjectAccessRequestFormatted).toHaveBeenCalledWith(req, sarId)
    },
  )
})
