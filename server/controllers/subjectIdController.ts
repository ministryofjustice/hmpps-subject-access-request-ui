import type { Request, Response } from 'express'
import { UserData } from '../@types/userdata'

export default class SubjectIdController {
  static getSubjectId(req: Request, res: Response) {
    if (req.session.userData === undefined) {
      req.session.userData = {}
    }
    const { userData } = req.session
    res.render('pages/subjectid', {
      subjectId: userData.subjectId,
    })
  }

  static saveSubjectId(req: Request, res: Response): void {
    const { subjectId } = req.body
    req.session.userData.subjectId = subjectId

    res.redirect('/inputs')
  }
}
