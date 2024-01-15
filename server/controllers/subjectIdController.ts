import type { Request, Response } from 'express'
import SubjectIdValidation from './subjectIdValidation'

export default class SubjectIdController {
  static getSubjectId(req: Request, res: Response) {
    if (req.session.userData === undefined) {
      req.session.userData = {}
    }
    const { subjectId } = req.session.userData

    res.render('pages/subjectid', {
      subjectId,
    })
  }

  static saveSubjectId(req: Request, res: Response): void {
    const { subjectId } = req.body
    const subjectIdError = SubjectIdValidation.validateSubjectId(subjectId)

    if (subjectIdError) {
      res.render('pages/subjectid', {
        subjectId,
        subjectIdError,
      })
    } else {
      req.session.userData.subjectId = subjectId
      res.redirect('/inputs')
    }
  }
}
