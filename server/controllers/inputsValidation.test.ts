import InputsValidation from './inputsValidation'

describe('validateDateFrom', () => {
  const errors = {
    format: 'Date From must be in the format dd/mm/yyyy',
    valid: 'Date From must be a valid date',
    future: 'Date From must not be in the future',
  }
  test('validates dateFrom value correctly', () => {
    const testCases = [
      { input: '', expected: '' },
      { input: '01/02/2002', expected: '' },
      { input: 'test', expected: errors.format },
      { input: '01/13/2022', expected: errors.valid },
      { input: '32/01/2022', expected: errors.valid },
      { input: '30/02/2023', expected: errors.valid },
      { input: 'a/01/2022', expected: errors.valid },
      { input: '01/a/2022', expected: errors.valid },
      { input: '01/01/a', expected: errors.valid },
      { input: '01/01/2150', expected: errors.future },
    ]
    testCases.forEach(testCase => {
      const actual = InputsValidation.validateDateRange(testCase.input, '')
      expect(actual.dateFromError).toEqual(testCase.expected)
    })
  })
})

describe('validateDateTo', () => {
  const errors = {
    format: 'Date To must be in the format dd/mm/yyyy',
    valid: 'Date To must be a valid date',
    future: 'Date To must not be in the future',
    after: 'Date To must be after Date From',
  }
  test('validates dateFrom value correctly', () => {
    const testCases = [
      { inputTo: '', inputFrom: '', expected: '' },
      { inputTo: '01/02/2001', inputFrom: '', expected: '' },
      { inputTo: 'test', inputFrom: '', expected: errors.format },
      { inputTo: '01/13/2022', inputFrom: '', expected: errors.valid },
      { inputTo: '32/01/2022', inputFrom: '', expected: errors.valid },
      { inputTo: '30/02/2023', inputFrom: '', expected: errors.valid },
      { inputTo: 'a/01/2022', inputFrom: '', expected: errors.valid },
      { inputTo: '01/a/2022', inputFrom: '', expected: errors.valid },
      { inputTo: '01/01/a', inputFrom: '', expected: errors.valid },
      { inputTo: '01/01/2150', inputFrom: '', expected: errors.future },
      { inputTo: '01/01/2021', inputFrom: '01/01/2022', expected: errors.after },
      { inputTo: '30/01/2021', inputFrom: '01/01/2022', expected: errors.after },
    ]
    testCases.forEach(testCase => {
      const actual = InputsValidation.validateDateRange(testCase.inputFrom, testCase.inputTo)
      expect(actual.dateToError).toEqual(testCase.expected)
    })
  })
})

describe('validateCaseReference', () => {
  const errors = {
    missing: 'Enter Case Reference',
    maxLength: 'Case Reference must be 20 characters or less',
  }
  test('validates caseReference value correctly', () => {
    const testCases = [
      { input: 'validReference', expected: '' },
      { input: '', expected: errors.missing },
      { input: 'invalidReferenceTooLong', expected: errors.maxLength },
    ]
    testCases.forEach(testCase => {
      const actual = InputsValidation.validateCaseReference(testCase.input)
      expect(actual).toEqual(testCase.expected)
    })
  })
})
