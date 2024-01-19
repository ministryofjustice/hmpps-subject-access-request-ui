import { Request, Response } from 'express'
import superagent from 'superagent'
import config from '../config'
import { isNomisId, isNdeliusId } from '../utils/idHelpers'
import { dataAccess } from '../data'

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

  static async getUserToken() {
    const token = await dataAccess().hmppsAuthClient.getSystemClientToken()
    return token
  }

  static async postReportDetails(req: Request, res: Response) {
    const token = await SummaryController.getUserToken()
    const userData = req.session.userData ?? {}
    const list: string[] = []
    const servicelist = req.session.selectedList
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
      const response = await superagent
        .post(`${config.apis.subjectAccessRequest.url}/api/createSubjectAccessRequest`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          dateFrom: userData.dateFrom,
          dateTo: userData.dateTo,
          sarCaseReferenceNumber: userData.caseReference,
          services: list.toString(),
          nomisId,
          ndeliusId,
        })
      res.redirect('/confirmation')
      return response
    } catch (error) {
      if (error.status === 404) {
        // error.status >= 400 && error.status < 500) {
        return null
      }
      throw error
    }
  }
}
