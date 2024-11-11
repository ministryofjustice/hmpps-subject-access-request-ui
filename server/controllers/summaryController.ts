import { Request, Response } from 'express'
import superagent from 'superagent'
import config from '../config'
import { isNomisId, isNdeliusId } from '../utils/idHelpers'
import { dataAccess } from '../data'
import getUserToken from '../utils/userTokenHelper'
import { AuditEvent, AuditSubjectType, auditWithSubject } from '../audit'
import { UserData } from '../@types/userdata'

export default class SummaryController {
  static getReportDetails(req: Request, res: Response) {
    const selectedList = req.session.selectedList ?? []
    const orderedList = selectedList.sort((a, b) => a.label.localeCompare(b.label))
    const userData = req.session.userData ?? ({} as UserData)

    const dateFrom = userData.dateFrom || 'Earliest available'
    const dateTo = userData.dateTo || 'Today'
    const dateRange = [dateFrom, dateTo].join(' - ')

    res.render('pages/summary', {
      subjectId: userData.subjectId,
      selectedList: orderedList.map(x => x.label).toString(),
      dateRange,
      caseReference: userData.caseReference,
    })
  }

  static async postReportDetails(req: Request, res: Response) {
    const userToken = getUserToken(req)
    const userData = req.session.userData ?? ({} as UserData)
    const { selectedList } = req.session

    if (dataAccess().telemetryClient) {
      dataAccess().telemetryClient.trackEvent({ name: 'postReportDetails', properties: { id: userData.subjectId } })
    }

    const serviceList = selectedList.map(service => `${service.name}, ${service.url}`)
    const nomisId = isNomisId(userData.subjectId) ? userData.subjectId.toString().toUpperCase() : null
    const ndeliusId = isNdeliusId(userData.subjectId) ? userData.subjectId.toString().toUpperCase() : null
    const commonProperties = {
      dateFrom: userData.dateFrom,
      dateTo: userData.dateTo,
      sarCaseReferenceNumber: userData.caseReference,
      services: serviceList.toString(),
      nomisId,
      ndeliusId,
    }

    const sendMessage = auditWithSubject(
      res.locals.user.username,
      userData.subjectId,
      AuditSubjectType.SAR_SUBJECT_ID,
      commonProperties,
    )
    await sendMessage(AuditEvent.REQUEST_REPORT_ATTEMPT)

    try {
      const response = await superagent
        .post(`${config.apis.subjectAccessRequest.url}/api/subjectAccessRequest`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(commonProperties)
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
