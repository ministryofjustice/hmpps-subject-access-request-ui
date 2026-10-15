import { formatDate, formatDateTime, formatReportDateTime } from './dateHelpers'

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

describe('format report date time', () => {
  it.each([
    ['2024-01-15T13:52:40.14177', '15/01/2024 13:52'],
    ['2024-07-15T13:52:40.14177', '15/07/2024 13:52'],
    ['2026-10-14T09:26:21.734394', '14/10/2026 09:26'],
    ['2024-07-15T23:30:00', '15/07/2024 23:30'],
    ['', ''],
  ])('preserves the local wall-clock time for %s', (timestamp, expected) => {
    expect(formatReportDateTime(timestamp)).toBe(expected)
  })
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
