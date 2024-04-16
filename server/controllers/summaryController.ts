import { Request, Response } from 'express'
import superagent from 'superagent'
import config from '../config'
import { isNomisId, isNdeliusId } from '../utils/idHelpers'
import { dataAccess } from '../data'
import getUserId from '../utils/userIdHelper'

export default class SummaryController {
  static getReportDetails(req: Request, res: Response) {
    const selectedList = req.session.selectedList ?? []
    const userData = req.session.userData ?? {}

    const dateFrom = userData.dateFrom || 'Earliest available'
    const dateTo = userData.dateTo || 'Today'
    const dateRange = [dateFrom, dateTo].join(' - ')

    res.render('pages/summary', {
      subjectId: userData.subjectId,
      selectedList: selectedList.map(x => x.text).toString(),
      dateRange,
      caseReference: userData.caseReference,
    })
  }

  static async postReportDetails(req: Request, res: Response) {
    const token = await SummaryController.getSystemToken()
    const userData = req.session.userData ?? {}
    const list: string[] = []
    const servicelist = req.session.selectedList
    const requestedBy = getUserId(req)

    if (dataAccess().telemetryClient) {
      dataAccess().telemetryClient.trackEvent({ name: 'postReportDetails', properties: { id: userData.subjectId } })
    }

    for (let i = 0; i < servicelist.length; i += 1) {
      list.push(`${servicelist[i].text}, ${servicelist[i].urls}`)
    }
    let nomisId: string = ''
    let ndeliusId: string = ''
    if (isNomisId(userData.subjectId)) {
      nomisId = userData.subjectId
    } else if (isNdeliusId(userData.subjectId)) {
      ndeliusId = userData.subjectId
    }

    try {
      if (requestedBy == null) {
        throw new Error('Could not identify SAR requestor. RequestedBy field is null.')
      } else {
        const response = await superagent
          .post(`${config.apis.subjectAccessRequest.url}/api/subjectAccessRequest`)
          .set('Authorization', `Bearer ${token}`)
          .send({
            dateFrom: userData.dateFrom,
            dateTo: userData.dateTo,
            sarCaseReferenceNumber: userData.caseReference,
            services: list.toString(),
            nomisId,
            ndeliusId,
            requestedBy,
          })
        res.redirect('/confirmation')
        return response
      }
    } catch (error) {
      if (error.status === 404) {
        // error.status >= 400 && error.status < 500) {
        return null
      }
      throw error
    }
  }

  static async getSystemToken() {
    const token = await dataAccess().hmppsAuthClient.getSystemClientToken()
    return token
  }
}
