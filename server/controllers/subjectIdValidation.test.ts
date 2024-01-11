import SubjectIdValidation from './subjectIdValidation'

describe('validateSubjectId', () => {
  const errors = {
    missing: 'Enter subject ID',
    invalid: 'Subject ID must be a NOMIS prisoner number or nDelius case reference number',
  }
  const accepted = ''

  test('validates that a subject ID is provided', () => {
    const subjectIdNotProvided = ''

    expect(SubjectIdValidation.validateSubjectId(subjectIdNotProvided)).toEqual(errors.missing)
  })

  describe('when a subject ID is provided', () => {
    test('accepts subject IDs in valid NOMIS ID format', () => {
      const validNomisIds = ['A1234BC', 'a1234bc', 'z9876YX', ' A1234BC', 'A1234BC ']
      validNomisIds.forEach(validNomisId => {
        expect(SubjectIdValidation.validateSubjectId(validNomisId)).toEqual(accepted)
      })
    })

    test('accepts subject IDs in valid nDelius ID format', () => {
      const validNdeliusIds = ['A123456', 'a123456', ' Z098765', 'Z098765 ']
      validNdeliusIds.forEach(validNdelousId => {
        expect(SubjectIdValidation.validateSubjectId(validNdelousId)).toEqual(accepted)
      })
    })

    test('rejects subject IDs in neither valid NOMIS or nDelius format', () => {
      const invalidIds = ['A1234B', 'a1234bcd', 'z987a6Y', 'A123 4BC', '-A12345']
      invalidIds.forEach(invalidId => {
        expect(SubjectIdValidation.validateSubjectId(invalidId)).toEqual(errors.invalid)
      })
    })
  })
})
