import type { Request, Response } from 'express'

import type { UserData } from '../@types/userdata'
import InputsValidation from './inputsValidation'
import formatDate from '../utils/dateHelpers'

export default class InputsController {
  static getInputs(req: Request, res: Response) {
    const userData: UserData = req.session.userData ?? {}
    const today = formatDate(new Date().toISOString(), 'short')
    const hasAllAnswers = req.session.selectedList && req.session.selectedList.length !== 0
    if (hasAllAnswers) {
      res.render('pages/inputs', {
        today,
        dateFrom: userData.dateFrom,
        dateTo: userData.dateTo || today,
        caseReference: userData.caseReference,
        buttonText: 'Confirm and return to summary page',
      })
      return
    }
    res.render('pages/inputs', {
      today,
      dateFrom: userData.dateFrom,
      dateTo: userData.dateTo || today,
      caseReference: userData.caseReference,
      buttonText: 'Confirm',
    })
  }

  static saveInputs(req: Request, res: Response): void {
    const { dateFrom, dateTo, caseReference } = req.body
    const { dateFromError, dateToError } = InputsValidation.validateDateRange(dateFrom, dateTo)
    const caseReferenceError = InputsValidation.validateCaseReference(caseReference)
    const hasAllAnswers = req.session.selectedList && req.session.selectedList.length !== 0

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
        buttonText: 'Confirm',
      })
    } else {
      req.session.userData.dateFrom = dateFrom
      req.session.userData.dateTo = dateTo
      req.session.userData.caseReference = caseReference

      if (hasAllAnswers) {
        res.redirect('/summary')
        return
      }
      res.redirect('/serviceselection')
    }
  }
}
