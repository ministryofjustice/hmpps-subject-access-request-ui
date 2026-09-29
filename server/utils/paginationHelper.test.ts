import getPageLinks from './paginationHelper'
import paginationHelperTestData from './paginationHelper.testData'

describe('Return pagination pages', () => {
  paginationHelperTestData.paginationTestCases.forEach(testData => {
    it(testData.description, () => {
      expect(getPageLinks(testData.params)).toEqual(testData.result)
    })
  })
})

describe('Pagination returns link with expected parameters', () => {
  paginationHelperTestData.searchOptionTestCases.forEach(testData => {
    it(testData.description, () => {
      expect(getPageLinks(testData.params)).toEqual(testData.expected)
    })
  })
})
