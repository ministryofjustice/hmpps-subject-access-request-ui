import type { Request, Response } from 'express'
import superagent from 'superagent'
import getPageLinks from '../utils/paginationHelper'
import config from '../config'
import { dataAccess } from '../data'
import getUserToken from '../utils/userTokenHelper'

const RESULTSPERPAGE = 50

export default class ReportsController {
  static async getReports(req: Request, res: Response) {
    const currentPage = (req.query.page || '1') as string

    const { reports, numberOfReports } = await ReportsController.getSubjectAccessRequestList(req, currentPage)
    const { pageLinks, previous, next, from, to } = await ReportsController.getPaginationInformation(
      numberOfReports,
      currentPage,
    )

    res.render('pages/reports', {
      reportList: reports,
      pageLinks,
      previous,
      next,
      from,
      to,
      numberOfReports,
    })
  }

  static async getSubjectAccessRequestList(req: Request, currentPage: string) {
    const token = getUserToken(req)
    const zeroIndexedPageNumber = this.zeroIndexPageNumber(currentPage)

    const response = await superagent
      .get(
        `${config.apis.subjectAccessRequest.url}/api/reports?pageSize=${RESULTSPERPAGE}&pageNumber=${zeroIndexedPageNumber}`,
      )
      .set('Authorization', `Bearer ${token}`)

    const numberOfReportsResponse = await superagent
      .get(`${config.apis.subjectAccessRequest.url}/api/totalSubjectAccessRequests`)
      .set('Authorization', `Bearer ${token}`)

    const reports = response.body
    const numberOfReports = numberOfReportsResponse.text

    return { reports, numberOfReports }
  }

  static async getSystemToken() {
    const token = await dataAccess().hmppsAuthClient.getSystemClientToken()
    return token
  }

  static async zeroIndexPageNumber(page: string) {
    let zeroIndexedPageNumber
    if (Number.parseInt(page, 10) <= 0) {
      zeroIndexedPageNumber = '0'
    } else {
      zeroIndexedPageNumber = (Number.parseInt(page, 10) - 1).toString()
    }
  }

  static async getPaginationInformation(numberOfReports: string, currentPage: string) {
    const numberOfReportsInt = Number.parseInt(numberOfReports, 10)
    const currentPageInt = Number.parseInt(currentPage, 10) || 1
    const visiblePageLinks = 5
    const numberOfPages = Math.ceil(numberOfReportsInt / RESULTSPERPAGE)

    const previous = currentPageInt - 1
    const next = currentPageInt === numberOfPages ? 0 : currentPageInt + 1

    const from = (currentPageInt - 1) * RESULTSPERPAGE + 1
    const to = Math.min(currentPageInt * RESULTSPERPAGE, numberOfReportsInt)

    const pageLinks = getPageLinks({ visiblePageLinks, numberOfPages, currentPage: currentPageInt })

    return { pageLinks, previous, next, from, to }
  }
}
