import { Request, Response } from 'express'
import { UserData } from '../@types/userdata'

export default class ConfirmationController {
  static getConfirmation(req: Request, res: Response) {
    const userData = req.session.userData ?? ({} as UserData)

    res.render('pages/confirmation', {
      caseReference: userData.caseReference,
    })

    req.session.userData = {} as UserData
    req.session.selectedList = []
  }
}
