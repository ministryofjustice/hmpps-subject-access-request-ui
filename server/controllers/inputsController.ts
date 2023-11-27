import type { Request, Response } from 'express'

import type { UserData } from '../@types/userdata'
import InputsValidation from './inputsValidation'
import formatDate from '../utils/dateHelpers'

export default class InputsController {
  static getInputs(req: Request, res: Response) {
    const userData: UserData = req.session.userData ?? {}
    const today = formatDate(new Date().toISOString(), 'short')
    res.render('pages/inputs', {
      today,
      dateFrom: userData.dateFrom,
      dateTo: userData.dateTo || today,
      caseReference: userData.caseReference,
    })
  }

  static saveInputs(req: Request, res: Response): void {
    const { dateFrom, dateTo, caseReference } = req.body
    const { dateFromError, dateToError } = InputsValidation.validateDateRange(dateFrom, dateTo)
    const caseReferenceError = InputsValidation.validateCaseReference(caseReference)
    if ([dateFromError, dateToError, caseReferenceError].some(item => !!item)) {
      const today = formatDate(new Date().toISOString(), 'short')
      res.render('pages/inputs', {
        today,
        dateFrom,
        dateTo: dateTo || today,
        caseReference,
        dateFromError,
        dateToError,
        caseReferenceError,
      })
      return
    }
    req.session.userData = {
      dateFrom: req.body.dateFrom,
      dateTo: req.body.dateTo,
      caseReference: req.body.caseReference,
    }
    res.redirect('/services')
  }
}
