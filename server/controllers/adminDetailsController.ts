import type { Request, Response } from 'express'
import type { SubjectAccessRequest } from '../@types/subjectAccessRequest'
import { formatDate, formatDateTime } from '../utils/dateHelpers'
import { audit, AuditEvent } from '../audit'

export default class AdminDetailsController {
  static async getAdminDetail(req: Request, res: Response) {
    const sarId = req.query.id
    const { subjectAccessRequests } = req.session

    const sendAudit = audit(res.locals.user.username, { sarId })
    await sendAudit(AuditEvent.VIEW_ADMIN_REPORT_DETAIL_ATTEMPT)

    const subjectAccessRequest = AdminDetailsController.getFormattedSar(
      subjectAccessRequests.find(sar => sar.id === sarId),
    )

    const searchParams = new URLSearchParams({})
    if (req.session.searchOptions) {
      if (req.session.searchOptions.searchTerm) searchParams.append('keyword', req.session.searchOptions.searchTerm)
      if (req.session.searchOptions.completed) searchParams.append('status', 'completed')
      if (req.session.searchOptions.errored) searchParams.append('status', 'errored')
      if (req.session.searchOptions.overdue) searchParams.append('status', 'overdue')
      if (req.session.searchOptions.pending) searchParams.append('status', 'pending')
    }

    res.render('pages/adminDetails', {
      subjectAccessRequest,
      searchParamsString: searchParams.toString(),
    })
  }

  static getFormattedSar(subjectAccessRequest: SubjectAccessRequest): SubjectAccessRequest {
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
