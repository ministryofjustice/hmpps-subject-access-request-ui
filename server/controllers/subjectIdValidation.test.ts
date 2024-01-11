import SubjectIdValidation from './subjectIdValidation'

describe('validateSubjectId', () => {
  const errors = {
    missing: 'Enter subject ID',
    valid: 'Subject ID must be a NOMIS prisoner number or nDelius case reference number',
  }

  test('validates that a subject ID is provided', () => {
    const subjectIdNotProvided = ''

    expect(SubjectIdValidation.validateSubjectId(subjectIdNotProvided)).toEqual(errors.missing)
  })

  test('validates that the subject ID is in a valid format for a NOMIS or nDelius ID', () => {
    const exampleNomisId = 'A1234BC'
    const exampleNdeliusId = 'A123456'
    const invalidSubjectId = 'A1A'

    expect(SubjectIdValidation.validateSubjectId(exampleNomisId)).toEqual('')
    expect(SubjectIdValidation.validateSubjectId(exampleNdeliusId)).toEqual('')
    expect(SubjectIdValidation.validateSubjectId(invalidSubjectId)).toEqual(errors.valid)
  })
})
