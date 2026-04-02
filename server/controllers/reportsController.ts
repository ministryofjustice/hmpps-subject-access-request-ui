import type { Request, Response } from 'express'
import type { Report } from '../@types/report'
import type { SubjectAccessRequest } from '../@types/subjectAccessRequest'
import { audit, AuditEvent } from '../audit'
import reportService from '../services/report'

const RESULTS_PER_PAGE = 50

export default class ReportsController {
  static async getReports(req: Request, res: Response) {
    const currentPage = (req.query.page || '1') as string

    const sendAudit = audit(res.locals.user.username, { page: currentPage })
    await sendAudit(AuditEvent.VIEW_REPORT_LIST_ATTEMPT)

    const { subjectAccessRequests, numberOfReports } = await reportService.getSubjectAccessRequestList(
      req,
      currentPage,
      RESULTS_PER_PAGE,
    )
    req.session.subjectAccessRequests = subjectAccessRequests
    const searchOptions = {
      searchTerm: String(req.query.keyword || ''),
    }
    req.session.searchOptions = searchOptions

    const { pageLinks, previous, next, from, to } = reportService.getPaginationInformation(
      numberOfReports,
      currentPage,
      searchOptions.searchTerm,
      RESULTS_PER_PAGE,
    )

    const reportList = ReportsController.getCondensedSarList(subjectAccessRequests)

    res.render('pages/reports', {
      reportList,
      pageLinks,
      previous,
      next,
      from,
      to,
      numberOfReports,
      searchTerm: searchOptions.searchTerm,
    })
  }

  static getCondensedSarList(subjectAccessRequests: SubjectAccessRequest[]): Report[] {
    return subjectAccessRequests.map(subjectAccessRequest => ({
      uuid: subjectAccessRequest.id.toString(),
      dateOfRequest: subjectAccessRequest.requestDateTime || '',
      sarCaseReference: subjectAccessRequest.sarCaseReferenceNumber,
      subjectId: subjectAccessRequest.nomisId || subjectAccessRequest.ndeliusCaseReferenceId,
      status: subjectAccessRequest.status.toString(),
      lastDownloaded: subjectAccessRequest.lastDownloaded || '',
    }))
  }
}
