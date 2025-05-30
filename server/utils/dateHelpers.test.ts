import { formatDate, formatDateTime } from './dateHelpers'

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

describe('format date time', () => {
  it.each([
    [null, null, undefined, ''],
    ['[default]', '2023-01-20T11:14:35', undefined, '20 January 2023 at 11:14:35 UTC'],
    ['long', '2023-01-20T11:14:35', 'long', '20 January 2023 at 11:14:35 UTC'],
    ['short', '2023-01-20T11:14:35', 'short', '20/01/2023, 11:14'],
    ['full', '2023-01-20T11:14:35', 'full', 'Friday, 20 January 2023 at 11:14:35 Coordinated Universal Time'],
    ['medium', '2023-01-20T11:14:35', 'medium', '20 Jan 2023, 11:14:35'],
  ])(
    '%s: formatDateTime(%s, %s)',
    (_: string, a: string, b: undefined | 'short' | 'full' | 'long' | 'medium', expected: string) => {
      expect(formatDateTime(a, b)).toEqual(expected)
    },
  )
})
