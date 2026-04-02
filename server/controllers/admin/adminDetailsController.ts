import type { Request, Response } from 'express'
import { audit, AuditEvent } from '../../audit'
import reportService from '../../services/report'

export default class AdminDetailsController {
  static async getAdminDetail(req: Request, res: Response) {
    const sarId = req.query.id as string

    const sendAudit = audit(res.locals.user.username, { sarId })
    await sendAudit(AuditEvent.VIEW_ADMIN_REPORT_DETAIL_ATTEMPT)

    const subjectAccessRequest = await reportService.getSubjectAccessRequestFormatted(req, sarId)
    const searchParamsString = AdminDetailsController.getSearchParamsString(req.session.searchOptions)

    res.render('pages/admin/adminDetails', { subjectAccessRequest, searchParamsString })
  }

  static async restartRequest(req: Request, res: Response) {
    const sarId = req.query.id as string
    const sendAudit = audit(res.locals.user.username, { sarId })
    await sendAudit(AuditEvent.RESTART_REPORT_ATTEMPT)

    const restartDetails = await reportService.restartSubjectAccessRequest(req, sarId)
    const subjectAccessRequest = await reportService.getSubjectAccessRequestFormatted(req, sarId)
    const searchParamsString = AdminDetailsController.getSearchParamsString(req.session.searchOptions)

    res.render('pages/admin/adminDetails', { subjectAccessRequest, searchParamsString, restartDetails })
  }

  private static getSearchParamsString(searchOptions: SearchOptions) {
    const searchParams = new URLSearchParams({})
    if (searchOptions) {
      if (searchOptions.searchTerm) searchParams.append('keyword', searchOptions.searchTerm)
      if (searchOptions.completed) searchParams.append('status', 'completed')
      if (searchOptions.errored) searchParams.append('status', 'errored')
      if (searchOptions.overdue) searchParams.append('status', 'overdue')
      if (searchOptions.pending) searchParams.append('status', 'pending')
    }
    return searchParams.toString()
  }
}
