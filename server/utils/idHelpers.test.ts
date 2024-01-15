import { isNomisId, isNdeliusId } from './idHelpers'

describe('idHelpers', () => {
  describe('isNomisId', () => {
    test('returns true if given an ID in a valid NOMIS ID format', () => {
      const validNomisIds = ['A1234BC', 'a1234bc', 'z9876YX', ' A1234BC', 'A1234BC ']
      validNomisIds.forEach(validNomisId => {
        expect(isNomisId(validNomisId)).toEqual(true)
      })
    })

    test('returns false if given an ID that is not in a valid NOMIS ID format', () => {
      const invalidIds = ['A123456', 'A1234B', 'a1234bcd', 'z987a6Y', 'A123 4BC', '-A12345']
      invalidIds.forEach(invalidId => {
        expect(isNomisId(invalidId)).toEqual(false)
      })
    })
  })

  describe('isNdeliusId', () => {
    test('returns true if given an ID in a valid nDelius ID format', () => {
      const validNdeliusIds = ['A123456', 'a123456', ' Z098765', 'Z098765 ']
      validNdeliusIds.forEach(validNdeliusId => {
        expect(isNdeliusId(validNdeliusId)).toEqual(true)
      })
    })

    test('returns false if given an ID that is not in a valid NOMIS ID format', () => {
      const invalidIds = ['A1234BC', 'A1234B', 'a1234bcd', 'z987a6Y', 'A123 4BC', '-A12345']
      invalidIds.forEach(invalidId => {
        expect(isNdeliusId(invalidId)).toEqual(false)
      })
    })
  })
})
