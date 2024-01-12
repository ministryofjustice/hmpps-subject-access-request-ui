import type { Request, Response } from 'express'
import SubjectIdValidation from './subjectIdValidation'

export default class SubjectIdController {
  static getSubjectId(req: Request, res: Response) {
    if (req.session.userData === undefined) {
      req.session.userData = {}
    }
    const subjectId = req.session.userData.nomisId ? req.session.userData.nomisId : req.session.userData.ndeliusId

    res.render('pages/subjectid', {
      subjectId,
    })
  }

  static saveSubjectId(req: Request, res: Response): void {
    const { subjectId } = req.body
    const validatedSubjectId = SubjectIdValidation.validateSubjectId(subjectId)

    if (validatedSubjectId === 'nomisId') {
      req.session.userData.nomisId = subjectId
      req.session.userData.ndeliusId = null
      res.redirect('/inputs')
      return
    }
    if (validatedSubjectId === 'ndeliusId') {
      req.session.userData.ndeliusId = subjectId
      req.session.userData.nomisId = null
      res.redirect('/inputs')
      return
    }
    res.render('pages/subjectid', {
      subjectId,
      subjectIdError: validatedSubjectId,
    })
  }
}
