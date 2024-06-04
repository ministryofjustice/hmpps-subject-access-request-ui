import { Request, Response } from 'express'

export default class ConfirmationController {
  static getConfirmation(req: Request, res: Response) {
    const userData = req.session.userData ?? {}

    res.render('pages/confirmation', {
      caseReference: userData.caseReference,
    })

    req.session.userData = {}
  }
}
