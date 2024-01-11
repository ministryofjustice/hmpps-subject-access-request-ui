import SubjectIdValidation from './subjectIdValidation'

describe('validateSubjectId', () => {
  const missing = 'Enter subject ID'

  test('validates that a subject ID is provided', () => {
    const subjectIdProvided = 'ExampleSubjectId'
    const subjectIdNotProvided = ''

    expect(SubjectIdValidation.validateSubjectId(subjectIdProvided)).toEqual('')
    expect(SubjectIdValidation.validateSubjectId(subjectIdNotProvided)).toEqual(missing)
  })
})
