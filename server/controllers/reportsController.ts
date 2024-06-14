import type { Request, Response } from 'express'
import superagent from 'superagent'
import getPageLinks from '../utils/paginationHelper'
import config from '../config'
import { dataAccess } from '../data'
import getUserToken from '../utils/userTokenHelper'

const RESULTSPERPAGE = 50
let currentPage = '1'

export default class ReportsController {
  static async getSubjectAccessRequestList(req: Request) {
    const token = getUserToken(req)
    let zeroIndexedPageNumber
    if (Number.parseInt(currentPage, 10) <= 0) {
      zeroIndexedPageNumber = '0'
    } else {
      zeroIndexedPageNumber = (Number.parseInt(currentPage, 10) - 1).toString()
    }
    const response = await superagent
      .get(
        `${config.apis.subjectAccessRequest.url}/api/reports?pageSize=${RESULTSPERPAGE}&pageNumber=${zeroIndexedPageNumber}&search=${req.query.keyword}`,
      )
      .set('Authorization', `Bearer ${token}`)

    const numberOfReportsResponse = await superagent
      .get(`${config.apis.subjectAccessRequest.url}/api/totalSubjectAccessRequests`)
      .set('Authorization', `Bearer ${token}`)
    const reports = response.body
    const numberOfReports = numberOfReportsResponse.text

    return { reports, numberOfReports }
  }

  static async getReports(req: Request, res: Response) {
    currentPage = (req.query.page || '1') as string
    const { reports, numberOfReports } = await ReportsController.getSubjectAccessRequestList(req)
    const numberOfReportsInt = Number.parseInt(numberOfReports, 10)
    const currentPageInt = Number.parseInt(currentPage, 10) || 1
    const visiblePageLinks = 5
    const numberOfPages = Math.ceil(numberOfReportsInt / RESULTSPERPAGE)

    const previous = currentPageInt - 1
    const next = currentPageInt === numberOfPages ? 0 : currentPageInt + 1

    const from = (currentPageInt - 1) * RESULTSPERPAGE + 1
    const to = Math.min(currentPageInt * RESULTSPERPAGE, numberOfReportsInt)

    const pageLinks = getPageLinks({ visiblePageLinks, numberOfPages, currentPage: currentPageInt })

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
