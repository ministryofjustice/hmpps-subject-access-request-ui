import type { Request, Response } from 'express'
import superagent from 'superagent'
import type { Report } from '../@types/report'
import type { SubjectAccessRequest } from '../@types/subjectAccessRequest'
import getPageLinks from '../utils/paginationHelper'
import config from '../config'
import getUserToken from '../utils/userTokenHelper'
import { audit, AuditEvent } from '../audit'

const RESULTS_PER_PAGE = 50

export default class ReportsController {
  static async getReports(req: Request, res: Response) {
    const currentPage = (req.query.page || '1') as string

    const sendAudit = audit(res.locals.user.username, { page: currentPage })
    await sendAudit(AuditEvent.VIEW_REPORT_LIST_ATTEMPT)

    const { subjectAccessRequests, numberOfReports } = await ReportsController.getSubjectAccessRequestList(
      req,
      currentPage,
    )
    const searchTerm = String(req.query.keyword || '')

    const { pageLinks, previous, next, from, to } = await ReportsController.getPaginationInformation(
      numberOfReports,
      currentPage,
      searchTerm,
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

  static getZeroIndexedPageNumber(page: string) {
    if (Number.parseInt(page, 10) <= 0) {
      return '0'
    }
    return (Number.parseInt(page, 10) - 1).toString()
  }

  static async getPaginationInformation(numberOfReports: string, currentPage: string, searchTerm: string) {
    const numberOfReportsInt = Number.parseInt(numberOfReports, 10)
    const currentPageInt = Number.parseInt(currentPage, 10) || 1
    const visiblePageLinks = 5
    const numberOfPages = Math.ceil(numberOfReportsInt / RESULTS_PER_PAGE)

    const previous = currentPageInt - 1
    const next = currentPageInt === numberOfPages ? 0 : currentPageInt + 1

    const from = (currentPageInt - 1) * RESULTS_PER_PAGE + 1
    const to = Math.min(currentPageInt * RESULTS_PER_PAGE, numberOfReportsInt)

    const pageLinks = getPageLinks({ visiblePageLinks, numberOfPages, currentPage: currentPageInt, searchTerm })

    return { pageLinks, previous, next, from, to }
  }

  static async getSubjectAccessRequestList(
    req: Request,
    currentPage: string,
  ): Promise<{
    subjectAccessRequests: SubjectAccessRequest[]
    numberOfReports: string
  }> {
    const token = getUserToken(req)
    const zeroIndexedPageNumber = this.getZeroIndexedPageNumber(currentPage)
    const keyword = (req.query.keyword || '') as string
    const response = await superagent
      .get(
        `${config.apis.subjectAccessRequest.url}/api/subjectAccessRequests?pageSize=${RESULTS_PER_PAGE}&pageNumber=${zeroIndexedPageNumber}&search=${keyword}`,
      )
      .set('Authorization', `Bearer ${token}`)

    const numberOfReportsResponse = await superagent
      .get(`${config.apis.subjectAccessRequest.url}/api/totalSubjectAccessRequests?search=${keyword}`)
      .set('Authorization', `Bearer ${token}`)

    const subjectAccessRequests = response.body
    const numberOfReports = numberOfReportsResponse.text

    return { subjectAccessRequests, numberOfReports }
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
