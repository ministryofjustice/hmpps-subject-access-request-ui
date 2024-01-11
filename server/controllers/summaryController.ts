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
    const response = await superagent
      .post(`http://localhost:8080/api/createSubjectAccessRequest`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        dateFrom: '01/12/2023',
        dateTo: '03/01/2024',
        sarCaseReferenceNumber: '1234abc',
        services: '1,2,4',
        nomisId: '',
        ndeliusCaseReferenceId: '1',
      })
    res.render('pages/summary')
    // res.redirect('pages/confirmation')
    return response
  }
}
