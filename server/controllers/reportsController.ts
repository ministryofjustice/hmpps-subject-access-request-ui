import type { Request, Response } from 'express'
import superagent from 'superagent'
import getPageLinks from '../utils/paginationHelper'
import config from '../config'
import { dataAccess } from '../data'

const RESULTSPERPAGE = 50
let currentPage = '1'

export default class ReportsController {
  static async getSubjectAccessRequestList() {
    // This should be user token once implemented
    const token = await ReportsController.getSystemToken()
    let zeroIndexedPageNumber
    if (Number.parseInt(currentPage, 10) <= 0) {
      zeroIndexedPageNumber = '0'
    } else {
      zeroIndexedPageNumber = (Number.parseInt(currentPage, 10) - 1).toString()
    }
    const response = await superagent
      .get(
        `${config.apis.subjectAccessRequest.url}/api/reports?pageSize=${RESULTSPERPAGE}&pageNumber=${zeroIndexedPageNumber}`,
      )
      .set('Authorization', `Bearer ${token}`)
    const numberOfReports = response.body.length
    const reports = response.body

    return { reports, numberOfReports }
  }

  static async getReports(req: Request, res: Response) {
    currentPage = (req.query.page || '1') as string
    const { reports, numberOfReports } = await ReportsController.getSubjectAccessRequestList()
    const parsedPage = Number.parseInt(currentPage, 10) || 1
    const visiblePageLinks = 5
    const numberOfPages = Math.ceil(numberOfReports / RESULTSPERPAGE)

    const previous = parsedPage - 1
    const next = parsedPage === numberOfPages ? 0 : parsedPage + 1

    const from = (parsedPage - 1) * RESULTSPERPAGE + 1
    const to = Math.min(parsedPage * RESULTSPERPAGE, numberOfReports)

    const pageLinks = getPageLinks({ visiblePageLinks, numberOfPages, currentPage: parsedPage })
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

  static async getSystemToken() {
    const token = await dataAccess().hmppsAuthClient.getSystemClientToken()
    return token
  }
}
