import type { Request, Response } from 'express'
import type { AdminReport } from '../../@types/report'
import type { AdminSubjectAccessRequest } from '../../@types/subjectAccessRequest'
import { audit, AuditEvent } from '../../audit'
import { formatDateTime } from '../../utils/dateHelpers'
import reportService from '../../services/report'

export const RESULTS_PER_PAGE = 50

export default class AdminReportsController {
  static async getAdminSummary(req: Request, res: Response) {
    const currentPage = (req.query.page || '1') as string
    req.session.currentPage = currentPage
    const searchOptions = {
      completed: !!req.query.status && (<Array<string>>req.query.status).includes('completed'),
      errored: !!req.query.status && (<Array<string>>req.query.status).includes('errored'),
      overdue: !!req.query.status && (<Array<string>>req.query.status).includes('overdue'),
      pending: !!req.query.status && (<Array<string>>req.query.status).includes('pending'),
      searchTerm: String(req.query.keyword || ''),
    }
    req.session.searchOptions = searchOptions

    const sendAudit = audit(res.locals.user.username, { page: currentPage })
    await sendAudit(AuditEvent.VIEW_ADMIN_REPORTS_ATTEMPT)

    const { subjectAccessRequests, numberOfReports, countSummary } =
      await reportService.getAdminSubjectAccessRequestDetails(req, searchOptions, currentPage, RESULTS_PER_PAGE)
    req.session.subjectAccessRequests = subjectAccessRequests

    const { pageLinks, previous, next, from, to } = reportService.getPaginationInformation(
      numberOfReports,
      currentPage,
      RESULTS_PER_PAGE,
      true,
      searchOptions,
    )

    const reportList = AdminReportsController.getSarSummaryList(subjectAccessRequests)

    res.render('pages/admin/adminReports', {
      reportList,
      pageLinks,
      from,
      to,
      numberOfReports,
      searchOptions,
      countSummary,
      nextLink: AdminReportsController.generatePaginationLink(next, searchOptions),
      previousLink: AdminReportsController.generatePaginationLink(previous, searchOptions),
      next,
      previous,
    })
  }

  static getSarSummaryList(subjectAccessRequests: AdminSubjectAccessRequest[]): AdminReport[] {
    return subjectAccessRequests.map(subjectAccessRequest => ({
      uuid: subjectAccessRequest.id.toString(),
      dateOfRequest: formatDateTime(subjectAccessRequest.requestDateTime, 'short'),
      sarCaseReference: subjectAccessRequest.sarCaseReferenceNumber,
      subjectId: subjectAccessRequest.nomisId || subjectAccessRequest.ndeliusCaseReferenceId,
      status: subjectAccessRequest.status.toString(),
      durationHumanReadable: subjectAccessRequest.durationHumanReadable,
      appInsightsEventsUrl: subjectAccessRequest.appInsightsEventsUrl,
    }))
  }

  static generatePaginationLink(pageIndex: number, searchOptions: SearchOptions) {
    const params = new URLSearchParams()
    params.append('page', String(pageIndex))

    if (searchOptions.searchTerm) {
      params.append('keyword', searchOptions.searchTerm)
    }
    if (searchOptions.completed) {
      params.append('status', 'completed')
    }
    if (searchOptions.pending) {
      params.append('status', 'pending')
    }
    if (searchOptions.errored) {
      params.append('status', 'errored')
    }
    if (searchOptions.overdue) {
      params.append('status', 'overdue')
    }
    return `/admin/reports?${params.toString()}`
  }
}
