import { Request, Response } from 'express'
import superagent from 'superagent'
import config from '../config'
import { isNomisId, isNdeliusId } from '../utils/idHelpers'
import { dataAccess } from '../data'
import getUserToken from '../utils/userTokenHelper'
import { AuditEvent, AuditSubjectType, auditWithSubject } from '../audit'

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
    const userToken = getUserToken(req)
    const userData = req.session.userData ?? {}
    const list: string[] = []
    const servicelist = req.session.selectedList

    if (dataAccess().telemetryClient) {
      dataAccess().telemetryClient.trackEvent({ name: 'postReportDetails', properties: { id: userData.subjectId } })
    }

    for (let i = 0; i < servicelist.length; i += 1) {
      list.push(`${servicelist[i].text}, ${servicelist[i].urls}`)
    }
    let nomisId: string = null
    let ndeliusId: string = null
    if (isNomisId(userData.subjectId)) {
      nomisId = userData.subjectId.toString().toUpperCase()
    } else if (isNdeliusId(userData.subjectId)) {
      ndeliusId = userData.subjectId.toString().toUpperCase()
    }

    const sendMessage = auditWithSubject(
      res.locals.user.username,
      userData.subjectId,
      AuditSubjectType.SAR_SUBJECT_ID,
      {
        dateFrom: userData.dateFrom,
        dateTo: userData.dateTo,
        sarCaseReferenceNumber: userData.caseReference,
        services: list.toString(),
        nomisId,
        ndeliusId,
      },
    )
    await sendMessage(AuditEvent.REQUEST_REPORT_ATTEMPT)

    try {
      const response = await superagent
        .post(`${config.apis.subjectAccessRequest.url}/api/subjectAccessRequest`)
        .set('Authorization', `Bearer ${userToken}`)
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
      await sendMessage(AuditEvent.REQUEST_REPORT_FAILURE)
      if (error.status === 404) {
        // error.status >= 400 && error.status < 500) {
        return null
      }
      throw error
    }
  }
}
