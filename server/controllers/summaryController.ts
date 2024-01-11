import { Request, Response } from 'express'
import superagent from 'superagent'
import RestClient from '../data/restClient'
import config from '../config'
import { dataAccess } from '../data'

export default class SummaryController {
  private static restClient(token: string): RestClient {
    return new RestClient('HMPPS Auth Client', config.apis.hmppsAuth, token)
  }

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

  static async postSARAPI(req: Request, res: Response) {
    const token = await dataAccess().hmppsAuthClient.getSystemClientToken()
    const date_from: String = '01/01/2001' 
    const date_to: String = '25/12/2022' 
    const sar_crn: String = '1'
    const services: String = '1'
    const nomis_id: String = '1'
    const ndelius_cri: String = ''
    const response = await superagent
      .post(`http://localhost:8080/api/createSubjectAccessRequest`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        dateFrom: date_from,
        dateTo: date_to,
        sarCaseReferenceNumber: sar_crn,
        services: services,
        nomisId: nomis_id,
        ndeliusCaseReferenceId: ndelius_cri,
      })
    res.redirect('/confirmation')
    return response
  }
}
