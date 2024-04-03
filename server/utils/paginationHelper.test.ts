import getPageLinks from './paginationHelper'
import paginationHelperTestData from './paginationHelper.testData'

describe('Return pagination pages', () => {
  paginationHelperTestData.forEach(testData => {
    it(testData.description, () => {
      expect(getPageLinks(testData.params)).toEqual(testData.result)
    })
  })
})
