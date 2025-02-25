import { NextFunction, Request, Response } from 'express'
import reportService from '../services/report'
import { formatDate } from '../utils/dateHelpers'
import { AuditEvent, AuditSubjectType, auditWithSubject } from '../audit'

export default class ReportDownloadController {
  static async getReport(req: Request, res: Response, next: NextFunction) {
    const fileId = req.query.id as string
    const sarCaseReference = req.query.sarCaseReference as string
    const subjectId = req.query.subjectId as string

    const sendMessage = auditWithSubject(res.locals.user.username, subjectId, AuditSubjectType.SAR_SUBJECT_ID, {
      fileId,
      sarCaseReference,
      subjectId,
    })
    await sendMessage(AuditEvent.DOWNLOAD_REPORT_ATTEMPT)

    if (!fileId || !subjectId || !sarCaseReference) {
      await sendMessage(AuditEvent.DOWNLOAD_REPORT_FAILURE)
      throw new Error('Report ID, subject ID or SAR case reference number missing.')
    }

    try {
      const downloadDate = formatDate(new Date().toISOString(), 'short')

      res.set(
        'Content-Disposition',
        `attachment;filename="subject-access-request-report-${downloadDate}-${sarCaseReference}-${subjectId}.pdf"`,
      )

      reportService.getReport(req, res, next, fileId)
    } catch (error) {
      await sendMessage(AuditEvent.DOWNLOAD_REPORT_FAILURE)
      next(error)
    }
  }
}
