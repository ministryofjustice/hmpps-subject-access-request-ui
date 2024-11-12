import type { Request, Response } from 'express'
import { auditService } from '@ministryofjustice/hmpps-audit-client'
import ReportDownloadController from './reportDownloadController'
import formatDate from '../utils/dateHelpers'
import { auditAction } from '../utils/testUtils'
import { AuditEvent } from '../audit'

beforeEach(() => {
  jest.resetAllMocks()
  jest.spyOn(auditService, 'sendAuditMessage').mockResolvedValue()
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('getReport', () => {
  test('creates a fileName from request query parameters', async () => {
    const res: Response = {
      set: jest.fn(),
      send: jest.fn(),
      locals: {
        user: {
          token: 'fakeUserToken',
          authSource: 'external',
          username: 'username',
        },
      },
    } as unknown as Response
    const req: Request = {
      session: {},
      query: {
        id: 'mock-file-ID',
        sarCaseReference: 'mock-sar-case-reference',
        subjectId: 'mock-subject-ID',
      },
    } as unknown as Request
    const next = jest.fn()
    const date = formatDate(new Date().toISOString(), 'short')

    await ReportDownloadController.getReport(req, res, next)

    expect(res.set).toHaveBeenCalled()
    expect(res.set).toHaveBeenCalledWith(
      'Content-Disposition',
      `attachment;filename="subject-access-request-report-${date}-mock-sar-case-reference-mock-subject-ID.pdf"`,
    )

    expect(auditService.sendAuditMessage).toHaveBeenCalledWith(auditAction(AuditEvent.DOWNLOAD_REPORT_ATTEMPT))
  })
})
