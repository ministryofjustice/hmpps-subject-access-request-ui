import type { Request, Response } from 'express'

import type { UserData } from '../@types/userdata'
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
      dateFromError: {
        text: 'error',
      },
    })
  }

  static saveInputs(req: Request, res: Response) {
    req.session.userData = {
      dateFrom: req.body.dateFrom,
      dateTo: req.body.dateTo,
      caseReference: req.body.caseReference,
    }
    res.redirect('/services')
  }
}
