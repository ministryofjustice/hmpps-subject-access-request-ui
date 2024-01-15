import ValidationError from '../utils/validationError'
import { isNdeliusId, isNomisId } from '../utils/idHelpers'

export default class SubjectIdValidation {
  static validateSubjectId(subjectId: string): string {
    try {
      // mandatory field - if blank, error
      if (!subjectId) {
        throw new ValidationError('Enter subject ID')
      }
      // validate that format matches Nomis or nDelius ID format
      else if (isNomisId(subjectId) || isNdeliusId(subjectId)) {
        return null
      } else {
        throw new ValidationError('Subject ID must be a NOMIS prisoner number or nDelius case reference number')
      }
    } catch (e) {
      return e.message
    }
  }
}
