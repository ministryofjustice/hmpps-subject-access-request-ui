import ValidationError from '../utils/validationError'

export default class SubjectIdValidation {
  static validateSubjectId(subjectId: string): string {
    try {
      // mandatory field - if blank, error
      if (!subjectId) {
        throw new ValidationError('Enter subject ID')
      }
    } catch (e) {
      return e.message
    }
    return ''
  }
}
