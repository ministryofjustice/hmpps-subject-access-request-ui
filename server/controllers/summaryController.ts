import { Request, Response } from 'express'
import superagent from 'superagent'
import config from '../config'
import HmppsAuthClient from '../data/hmppsAuthClient'
import TokenStore from '../data/tokenStore'
import { createRedisClient } from '../data/redisClient'

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

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  static async postSARAPI(req: Request, res: Response, hmppsAuthClient?: any) {
    let authClient = hmppsAuthClient || null
    if (authClient == null) {
      authClient = new HmppsAuthClient(new TokenStore(createRedisClient()))
    }
    const token = await authClient.getSystemClientToken()
    const userData = req.session.userData ?? {}
    const list: string[] = []
    const servicelist = req.session.selectedList
    for (let i = 0; i < servicelist.length; i += 1) {
      list.push(`${servicelist[i].text}, ${servicelist[i].value}`)
    }
    try {
      const response = await superagent
        .post(`${config.apis.createSubjectAccessRequest.url}/api/createSubjectAccessRequest`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          dateFrom: userData.dateFrom,
          dateTo: userData.dateTo,
          sarCaseReferenceNumber: userData.caseReference,
          services: list.toString(),
          nomisId: userData.subjectId || '',
          ndeliusCaseReferenceId: userData.ndeliusCaseReferenceId || '',
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
