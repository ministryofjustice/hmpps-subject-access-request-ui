import type { Request, Response } from 'express'
import superagent from 'superagent'
import getPageLinks from '../utils/paginationHelper'
import config from '../config'
import { dataAccess } from '../data'
import getUserToken from '../utils/userTokenHelper'
import { sub } from 'date-fns'

const RESULTSPERPAGE = 50

export default class ReportsController {
  static async getReports(req: Request, res: Response) {
    const currentPage = (req.query.page || '1') as string

    const { reports, numberOfReports } = await ReportsController.getSubjectAccessRequestList(req, currentPage)
    const { pageLinks, previous, next, from, to } = await ReportsController.getPaginationInformation(
      numberOfReports,
      currentPage,
    )

    //TODO:
    // - call getCondensedSarList on the output of getSubjectAccessRequestList to get a condensed SAR list
    // - pass the condensed list to the page for rendering, rather than the long-form one

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

  // TODO:
  // - Delete this function (and tests) and rename getNewSubjectAccessRequestList
  static async getSubjectAccessRequestList(req: Request, currentPage: string) {
    const token = getUserToken(req)
    const zeroIndexedPageNumber = this.getZeroIndexedPageNumber(currentPage)

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

  static getZeroIndexedPageNumber(page: string) {
    if (Number.parseInt(page, 10) <= 0) {
      return '0'
    }
    return (Number.parseInt(page, 10) - 1).toString()
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

  // TODO:
  // Rename this function 'getSubjectAccessRequestList' , delete the old version
  static async newGetSubjectAccessRequestList(req: Request, currentPage: string) {
    const token = getUserToken(req)
    const zeroIndexedPageNumber = this.getZeroIndexedPageNumber(currentPage)

    const response = await superagent
      .get(
        `${config.apis.subjectAccessRequest.url}/api/subjectAccessRequests?pageSize=${RESULTSPERPAGE}&pageNumber=${zeroIndexedPageNumber}`,
      )
      .set('Authorization', `Bearer ${token}`)

    const numberOfReportsResponse = await superagent
      .get(`${config.apis.subjectAccessRequest.url}/api/totalSubjectAccessRequests`)
      .set('Authorization', `Bearer ${token}`)

    const subjectAccessRequests = response.body
    const numberOfReports = numberOfReportsResponse.text

    return { subjectAccessRequests, numberOfReports }
  }


  static async getCondensedSarList(subjectAccessRequests) {

  }
}

