import type { NextFunction, Request, Response } from 'express'
import proxy from 'express-http-proxy'
import superagent from 'superagent'
import config from '../config'
import type { AdminSubjectAccessRequest, SubjectAccessRequest } from '../@types/subjectAccessRequest'
import getUserToken from '../utils/userTokenHelper'
import getPageLinks from '../utils/paginationHelper'
import logger from '../../logger'
import getSanitisedError from '../sanitisedError'

const getReport = (req: Request, res: Response, next: NextFunction, fileId: string) =>
  proxy(config.apis.subjectAccessRequest.url, {
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    proxyReqOptDecorator: (proxyReqOpts: any) => {
      // eslint-disable-next-line  no-param-reassign
      proxyReqOpts.headers.Authorization = `Bearer ${req.user.token}`
      return proxyReqOpts
    },
    proxyReqPathResolver: () => {
      return `/api/report?id=${fileId}`
    },
    limit: '10mb',
  })(req, res, next)

const getZeroIndexedPageNumber = (page: string) => {
  if (Number.parseInt(page, 10) <= 0) {
    return '0'
  }
  return (Number.parseInt(page, 10) - 1).toString()
}

const getSubjectAccessRequestList = async (
  req: Request,
  currentPage: string,
  resultsPerPage: number,
): Promise<{
  subjectAccessRequests: SubjectAccessRequest[]
  numberOfReports: string
}> => {
  const token = getUserToken(req)
  const zeroIndexedPageNumber = getZeroIndexedPageNumber(currentPage)
  const keyword = (req.query.keyword || '') as string
  const response = await superagent
    .get(
      `${config.apis.subjectAccessRequest.url}/api/subjectAccessRequests?pageSize=${resultsPerPage}&pageNumber=${zeroIndexedPageNumber}&search=${keyword}`,
    )
    .set('Authorization', `Bearer ${token}`)

  const numberOfReportsResponse = await superagent
    .get(`${config.apis.subjectAccessRequest.url}/api/totalSubjectAccessRequests?search=${keyword}`)
    .set('Authorization', `Bearer ${token}`)

  const subjectAccessRequests = response.body
  const numberOfReports = numberOfReportsResponse.text

  return { subjectAccessRequests, numberOfReports }
}

const getAdminSubjectAccessRequestDetails = async (
  req: Request,
  searchOptions: SearchOptions,
  currentPage: string,
  resultsPerPage: number,
): Promise<{
  subjectAccessRequests: AdminSubjectAccessRequest[]
  numberOfReports: string
  countSummary: CountSummary
}> => {
  const token = getUserToken(req)
  const zeroIndexedPageNumber = getZeroIndexedPageNumber(currentPage)
  const response = await superagent
    .get(
      `${config.apis.subjectAccessRequest.url}/api/admin/subjectAccessRequests?completed=${searchOptions.completed}&errored=${searchOptions.errored}&overdue=${searchOptions.overdue}&pending=${searchOptions.pending}&pageSize=${resultsPerPage}&pageNumber=${zeroIndexedPageNumber}&search=${searchOptions.searchTerm}`,
    )
    .set('Authorization', `Bearer ${token}`)

  const subjectAccessRequests = response.body.requests
  const numberOfReports = response.body.filterCount
  const { totalCount, completedCount, erroredCount, overdueCount, pendingCount } = response.body
  const countSummary = { totalCount, completedCount, erroredCount, overdueCount, pendingCount }

  return {
    subjectAccessRequests,
    numberOfReports,
    countSummary,
  }
}

const restartSubjectAccessRequest = async (req: Request, sarId: string) => {
  const token = getUserToken(req)
  return superagent
    .patch(`${config.apis.subjectAccessRequest.url}/api/admin/subjectAccessRequests/${sarId}/restart`)
    .set('Authorization', `Bearer ${token}`)
    .then(res => ({ success: res.status === 200 }))
    .catch(error => {
      logger.error(getSanitisedError(error), 'Error restarting subject access request')
      return { success: false, message: error.response.body.userMessage }
    })
}

const getPaginationInformation = (
  numberOfReports: string,
  currentPage: string,
  searchTerm: string,
  resultsPerPage: number,
) => {
  const numberOfReportsInt = Number.parseInt(numberOfReports, 10)
  const currentPageInt = Number.parseInt(currentPage, 10) || 1
  const visiblePageLinks = 5
  const numberOfPages = Math.ceil(numberOfReportsInt / resultsPerPage)

  const previous = currentPageInt - 1
  const next = currentPageInt === numberOfPages ? 0 : currentPageInt + 1

  const from = (currentPageInt - 1) * resultsPerPage + 1
  const to = Math.min(currentPageInt * resultsPerPage, numberOfReportsInt)

  const pageLinks = getPageLinks({ visiblePageLinks, numberOfPages, currentPage: currentPageInt, searchTerm })

  return { pageLinks, previous, next, from, to }
}

export default {
  getReport,
  getSubjectAccessRequestList,
  getAdminSubjectAccessRequestDetails,
  getPaginationInformation,
  restartSubjectAccessRequest,
}
