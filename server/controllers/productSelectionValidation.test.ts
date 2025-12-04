import ProductSelectionValidation from './productSelectionValidation'

const productList: Product[] = [
  { id: '1', name: 'test1', label: 'Test one', url: 'http://foo.boo', order: 1, enabled: true },
  { id: '2', name: 'test2', label: 'Test two', url: 'http://foo.boo2', order: 2, enabled: true },
  { id: '3', name: 'test3', label: 'Test three', url: 'http://foo.boo3', order: 3, enabled: true },
]

describe('validateSelection', () => {
  const errors = {
    select: 'At least one product must be selected',
    invalidSelection: 'Invalid product selection',
  }
  test('checks for no selections correctly', () => {
    const testCases = [
      { input: [], expected: errors.select },
      { input: ['test1'], expected: '' },
    ]
    testCases.forEach(testCase => {
      const selectedProductsError = ProductSelectionValidation.validateSelection(testCase.input, productList)
      expect(selectedProductsError).toEqual(testCase.expected)
    })
  })
  test('checks for invalid product selection', () => {
    const testCases = [
      { input: ['randomId'], expected: errors.invalidSelection },
      { input: ['test1', 'randomId'], expected: errors.invalidSelection },
      { input: ['test1'], expected: '' },
      { input: ['test3'], expected: '' },
      { input: ['test1', 'test3'], expected: '' },
    ]
    testCases.forEach(testCase => {
      const selectedProductsError = ProductSelectionValidation.validateSelection(testCase.input, productList)
      expect(selectedProductsError).toEqual(testCase.expected)
    })
  })
})

describe('validateSingleSelection', () => {
  const errors = {
    select: 'A product must be selected',
    invalidSelection: 'Invalid product selection',
  }
  test('checks for no selection correctly', () => {
    const testCases = [
      { input: '', expected: errors.select },
      { input: null, expected: errors.select },
      { input: '1', expected: '' },
      { input: '2', expected: '' },
      { input: '3', expected: '' },
    ]
    testCases.forEach(testCase => {
      const selectedProductsError = ProductSelectionValidation.validateSingleSelection(testCase.input, productList)
      expect(selectedProductsError).toEqual(testCase.expected)
    })
  })
  test('checks for invalid product selection', () => {
    const testCases = [
      { input: '999', expected: errors.invalidSelection },
      { input: '1', expected: '' },
    ]
    testCases.forEach(testCase => {
      const selectedProductsError = ProductSelectionValidation.validateSingleSelection(testCase.input, productList)
      expect(selectedProductsError).toEqual(testCase.expected)
    })
  })
})
