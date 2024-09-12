import { Request, Response, NextFunction } from 'express'
import getReport from '../services/report'
import formatDate from '../utils/dateHelpers'

export default class ReportDownloadController {
  static getReport(req: Request, res: Response, next: NextFunction) {
    const fileId = req.query.id as string
    const sarCaseReference = req.query.sarCaseReference as string
    const subjectId = req.query.subjectId as string

    if (!fileId || !subjectId || !sarCaseReference) {
      throw new Error('Report ID, subject ID or SAR case reference number missing.')
    }

    const downloadDate = formatDate(new Date().toISOString(), 'short')

    res.set(
      'Content-Disposition',
      `attachment;filename="subject-access-request-report-${downloadDate}-${sarCaseReference}-${subjectId}.pdf"`,
    )

    getReport(req, res, next, fileId)
  }
}
