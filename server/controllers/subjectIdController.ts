import type { Request, Response } from 'express'
import SubjectIdValidation from './subjectIdValidation'

export default class SubjectIdController {
  static getSubjectId(req: Request, res: Response) {
    if (req.session.userData === undefined) {
      req.session.userData = {}
    }
    const { subjectId } = req.session.userData
    const hasAllAnswers = req.session.selectedList && req.session.selectedList.length !== 0
    if (hasAllAnswers) {
      res.render('pages/subjectid', {
        subjectId,
        buttonText: 'Continue to summary page',
      })
    }

    res.render('pages/subjectid', {
      subjectId,
      buttonText: 'Confirm',
    })
  }

  static saveSubjectId(req: Request, res: Response): void {
    const { subjectId } = req.body
    const subjectIdError = SubjectIdValidation.validateSubjectId(subjectId)
    const hasAllAnswers = req.session.selectedList && req.session.selectedList.length !== 0

    if (subjectIdError) {
      res.render('pages/subjectid', {
        subjectId,
        subjectIdError,
      })
    } else {
      req.session.userData.subjectId = subjectId

      if (hasAllAnswers) {
        res.redirect('/summary')
        return
      }
      res.redirect('/inputs')
    }
  }
}
