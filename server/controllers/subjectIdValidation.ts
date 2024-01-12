import ValidationError from '../utils/validationError'

export default class SubjectIdValidation {
  static validateSubjectId(subjectId: string): string {
    const nomisId = /^[A-Za-z][0-9]{4}[A-Za-z]{2}$/
    const ndeliusId = /^[A-Za-z][0-9]{6}$/

    try {
      // mandatory field - if blank, error
      if (!subjectId) {
        throw new ValidationError('Enter subject ID')
      }
      // validate that format matches Nomis or nDelius ID format
      else if (nomisId.exec(subjectId.trim())) {
        return 'nomisId'
      } else if (ndeliusId.exec(subjectId.trim())) {
        return 'ndeliusId'
      } else {
        throw new ValidationError('Subject ID must be a NOMIS prisoner number or nDelius case reference number')
      }
    } catch (e) {
      return e.message
    }
  }
}
