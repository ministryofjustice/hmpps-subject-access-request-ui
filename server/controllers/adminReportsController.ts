import type { Request, Response } from 'express'
import type { Report } from '../@types/report'
import type { SubjectAccessRequest } from '../@types/subjectAccessRequest'
import { audit, AuditEvent } from '../audit'
import { formatDateTime } from '../utils/dateHelpers'
import reportService from '../services/report'

const RESULTS_PER_PAGE = 50

export default class AdminReportsController {
  static async getAdminSummary(req: Request, res: Response) {
    const currentPage = (req.query.page || '1') as string

    const sendAudit = audit(res.locals.user.username, { page: currentPage })
    await sendAudit(AuditEvent.VIEW_ADMIN_REPORTS_ATTEMPT)

    const { subjectAccessRequests, numberOfReports } = await reportService.getSubjectAccessRequestList(
      req,
      currentPage,
      RESULTS_PER_PAGE,
    )
    const searchTerm = String(req.query.keyword || '')
    req.session.subjectAccessRequests = subjectAccessRequests

    const { pageLinks, previous, next, from, to } = reportService.getPaginationInformation(
      numberOfReports,
      currentPage,
      searchTerm,
      RESULTS_PER_PAGE,
    )

    const reportList = AdminReportsController.getSarSummaryList(subjectAccessRequests)

    res.render('pages/adminReports', {
      reportList,
      pageLinks,
      previous,
      next,
      from,
      to,
      numberOfReports,
      searchTerm,
    })
  }

  static getSarSummaryList(subjectAccessRequests: SubjectAccessRequest[]): Report[] {
    return subjectAccessRequests.map(subjectAccessRequest => ({
      uuid: subjectAccessRequest.id.toString(),
      dateOfRequest: formatDateTime(subjectAccessRequest.requestDateTime, 'short'),
      sarCaseReference: subjectAccessRequest.sarCaseReferenceNumber,
      subjectId: subjectAccessRequest.nomisId || subjectAccessRequest.ndeliusCaseReferenceId,
      status: subjectAccessRequest.status.toString(),
    }))
  }
}
