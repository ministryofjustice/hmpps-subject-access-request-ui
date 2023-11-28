import ServiceSelectionValidation from './serviceSelectionValidation'

describe('validateSelection', () => {
  const errors = {
    select: 'At least one service must be selected',
  }
  test('checks for no selections correctly', () => {
    const testCases = [
      { input: [], expected: errors.select },
      { input: [{ text: 'service', value: 'service.com', id: '1' }], expected: '' },
    ]
    testCases.forEach(testCase => {
      const selectedServicesError = ServiceSelectionValidation.validateSelection(testCase.input)
      expect(selectedServicesError).toEqual(testCase.expected)
    })
  })
})
