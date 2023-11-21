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
    })
  }
}
