import { ApiService } from '../@types/apiservice'
import ServiceSelectionValidation from './serviceSelectionValidation'

describe('validateSelection', () => {
  const errors = {
    select: 'At least one service must be selected',
    invalidSelection: 'Invalid service selection',
  }
  test('checks for no selections correctly', () => {
    const testCases = [
      { input: [], expected: errors.select },
      { input: ['1'], expected: '' },
    ]
    const mockService: ApiService[] = [
      { id: '1', text: 'mockService', value: 'http://foo.boo', name: 'test1', environments: [] },
    ]
    testCases.forEach(testCase => {
      const selectedServicesError = ServiceSelectionValidation.validateSelection(testCase.input, mockService)
      expect(selectedServicesError).toEqual(testCase.expected)
    })
  })
  test('checks for invalid service selection', () => {
    const testCases = [
      { input: ['randomId'], expected: errors.invalidSelection },
      { input: ['1'], expected: '' },
    ]
    const mockService: ApiService[] = [
      { id: '1', text: 'mockService', value: 'http://foo.boo', name: 'test2', environments: [] },
    ]
    testCases.forEach(testCase => {
      const selectedServicesError = ServiceSelectionValidation.validateSelection(testCase.input, mockService)
      expect(selectedServicesError).toEqual(testCase.expected)
    })
  })
})
