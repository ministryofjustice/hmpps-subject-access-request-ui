import type { Request, Response } from 'express'
import type { SubjectAccessRequest } from '../@types/subjectAccessRequest'
import { formatDate, formatDateTime } from '../utils/dateHelpers'
import { audit, AuditEvent } from '../audit'

export default class AdminDetailsController {
  static async getAdminDetail(req: Request, res: Response) {
    const sarId = req.query.id
    const { subjectAccessRequests } = req.session

    const sendAudit = audit(res.locals.user.username, { sarId })
    await sendAudit(AuditEvent.VIEW_ADMIN_DETAIL_ATTEMPT)

    const subjectAccessRequest = AdminDetailsController.getFormattedSar(
      subjectAccessRequests.find(sar => sar.id === sarId),
    )

    res.render('pages/adminDetails', {
      subjectAccessRequest,
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
