import ValidationError from '../utils/validationError'

export default class SubjectIdValidation {
  static validateSubjectId(subjectId: string): string {
    try {
      // mandatory field - if blank, error
      if (!subjectId) {
        throw new ValidationError('Enter subject ID')
      }
      // validate that format matches Nomis or nDelius ID format
      if (!/^[A-Za-z][0-9]{4}[A-Za-z]{2}$/.exec(subjectId) && !/^[A-Za-z][0-9]{6}$/.exec(subjectId)) {
        throw new ValidationError('Subject ID must be a NOMIS prisoner number or nDelius case reference number')
      }
    } catch (e) {
      return e.message
    }
    return ''
  }
}
