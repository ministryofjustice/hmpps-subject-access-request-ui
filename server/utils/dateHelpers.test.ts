import formatDate from './dateHelpers'

describe('format date', () => {
  it.each([
    [null, null, undefined, ''],
    ['[default]', '01-20-2023', undefined, '20 January 2023'],
    ['long', '01-20-2023', 'long', '20 January 2023'],
    ['short', '01-20-2023', 'short', '20/01/2023'],
    ['full', '01-20-2023', 'full', 'Friday, 20 January 2023'],
    ['medium', '01-20-2023', 'medium', '20 Jan 2023'],
  ])(
    '%s: formatDate(%s, %s)',
    (_: string, a: string, b: undefined | 'short' | 'full' | 'long' | 'medium', expected: string) => {
      expect(formatDate(a, b)).toEqual(expected)
    },
  )
})
