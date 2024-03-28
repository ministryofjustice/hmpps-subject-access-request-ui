import type { Request, Response } from 'express'
import SubjectIdValidation from './subjectIdValidation'
import { dataAccess } from '../data'

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
        buttonText: 'Confirm and return to summary page',
      })
      return
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
    if (dataAccess().telemetryClient) {
      dataAccess().telemetryClient.trackEvent({
        name: 'saveSubjectId',
        properties: { id: req.session.userData.subjectId },
      })
    }
    if (subjectIdError) {
      res.render('pages/subjectid', {
        subjectId,
        subjectIdError,
        buttonText: 'Confirm',
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
