import ServiceSelectionValidation from './serviceSelectionValidation'

describe('validateSelection', () => {
  const errors = {
    select: 'At least one service must be selected',
    invalidSelection: 'Invalid service selection',
  }
  test('checks for no selections correctly', () => {
    const testCases = [
      { input: [], expected: errors.select },
      { input: ['test1'], expected: '' },
    ]
    const mockService: Service[] = [
      { id: '1', name: 'test1', label: 'Test one', url: 'http://foo.boo', order: 1, enabled: true },
    ]
    testCases.forEach(testCase => {
      const selectedServicesError = ServiceSelectionValidation.validateSelection(testCase.input, mockService)
      expect(selectedServicesError).toEqual(testCase.expected)
    })
  })
  test('checks for invalid service selection', () => {
    const testCases = [
      { input: ['randomId'], expected: errors.invalidSelection },
      { input: ['test1'], expected: '' },
    ]
    const mockService: Service[] = [
      { id: '1', name: 'test1', label: 'Test one', url: 'http://foo.boo', order: 1, enabled: true },
    ]
    testCases.forEach(testCase => {
      const selectedServicesError = ServiceSelectionValidation.validateSelection(testCase.input, mockService)
      expect(selectedServicesError).toEqual(testCase.expected)
    })
  })
})
