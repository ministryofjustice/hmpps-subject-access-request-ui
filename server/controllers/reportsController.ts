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
    const searchTerm = String(req.query.keyword || '')

    const { pageLinks, previous, next, from, to } = reportService.getPaginationInformation(
      numberOfReports,
      currentPage,
      searchTerm,
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
      searchTerm,
    })
  }

  static getCondensedSarList(subjectAccessRequests: SubjectAccessRequest[]): Report[] {
    return subjectAccessRequests.map(subjectAccessRequest => ({
      uuid: subjectAccessRequest.id.toString(),
      dateOfRequest: this.getFormattedDateTime(subjectAccessRequest.requestDateTime),
      sarCaseReference: subjectAccessRequest.sarCaseReferenceNumber,
      subjectId: subjectAccessRequest.nomisId || subjectAccessRequest.ndeliusCaseReferenceId,
      status: subjectAccessRequest.status.toString(),
      lastDownloaded: (this.getFormattedDateTime(subjectAccessRequest.lastDownloaded) || '').toString(),
    }))
  }

  static getFormattedDateTime(dateTimeString: string): string {
    if (dateTimeString != null) {
      const padded = (value: number): string => value.toString().padStart(2, '0')
      const dateTime: Date = new Date(dateTimeString)

      const day = `${padded(dateTime.getDate())}`
      const month = `${padded(dateTime.getMonth() + 1)}`
      const year = `${dateTime.getFullYear()}`
      const hour = `${padded(dateTime.getHours())}`
      const minute = `${padded(dateTime.getMinutes())}`

      return `${day}/${month}/${year} ${hour}:${minute}`
    }
    return null
  }
}
