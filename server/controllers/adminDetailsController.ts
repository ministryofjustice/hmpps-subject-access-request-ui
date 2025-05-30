import type { Request, Response } from 'express'
import type { SubjectAccessRequest } from '../@types/subjectAccessRequest'
import { formatDate, formatDateTime } from '../utils/dateHelpers'
import { audit, AuditEvent } from '../audit'
import reportService from '../services/report'
import { RESULTS_PER_PAGE } from './adminReportsController'

export default class AdminDetailsController {
  static async getAdminDetail(req: Request, res: Response) {
    const sarId = req.query.id as string
    const { subjectAccessRequests } = req.session

    const sendAudit = audit(res.locals.user.username, { sarId })
    await sendAudit(AuditEvent.VIEW_ADMIN_REPORT_DETAIL_ATTEMPT)

    const subjectAccessRequest = AdminDetailsController.getFormattedSar(subjectAccessRequests, sarId)
    const searchParamsString = AdminDetailsController.getSearchParamsString(req.session.searchOptions)

    res.render('pages/adminDetails', { subjectAccessRequest, searchParamsString })
  }

  static async restartRequest(req: Request, res: Response) {
    const sarId = req.query.id as string
    const sendAudit = audit(res.locals.user.username, { sarId })
    await sendAudit(AuditEvent.RESTART_REPORT_ATTEMPT)

    const restartDetails = await reportService.restartSubjectAccessRequest(req, sarId)

    const { subjectAccessRequests } = await reportService.getAdminSubjectAccessRequestDetails(
      req,
      req.session.searchOptions,
      req.session.currentPage,
      RESULTS_PER_PAGE,
    )
    req.session.subjectAccessRequests = subjectAccessRequests

    const subjectAccessRequest = AdminDetailsController.getFormattedSar(subjectAccessRequests, sarId)
    const searchParamsString = AdminDetailsController.getSearchParamsString(req.session.searchOptions)

    res.render('pages/adminDetails', { subjectAccessRequest, searchParamsString, restartDetails })
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

  private static getFormattedSar(subjectAccessRequests: SubjectAccessRequest[], sarId: string): SubjectAccessRequest {
    const subjectAccessRequest = subjectAccessRequests.find(sar => sar.id === sarId)
    return {
      ...subjectAccessRequest,
      requestDateTime: formatDateTime(subjectAccessRequest.requestDateTime),
      dateFrom: formatDate(subjectAccessRequest.dateFrom),
      dateTo: formatDate(subjectAccessRequest.dateTo),
      claimDateTime: formatDateTime(subjectAccessRequest.claimDateTime),
      lastDownloaded: formatDateTime(subjectAccessRequest.lastDownloaded),
    }
  }
}
