/**
 * Formats an ISO-8601 date string to standard gov.uk display format, e.g. 20 January 2023
 *
 * Also supports passing in an optional style string to output other standard formats:
 * short, full and medium - e.g. '20/01/2023', 'Friday, 20 January 2023' and '20 Jan 2023'
 *
 * @param isoDate ISO-8601 format date string
 * @param style formatting style to use - long (default), short, full, medium
 * @returns formatted date string
 */
export const formatDate = (isoDate: string, style: 'short' | 'full' | 'long' | 'medium' = 'long'): string => {
  if (!isoDate) return ''
  return new Date(isoDate).toLocaleDateString('en-gb', { dateStyle: style })
}

/**
 * Formats an ISO-8601 date and time string to standard display format, e.g. 20 January 2023 at 16:33:03 GMT
 *
 * Also supports passing in an optional style string to output other standard formats:
 * short, full and medium
 *
 * @param isoDate ISO-8601 format date time string
 * @param style formatting style to use - long (default), short, full, medium
 * @returns formatted date time string
 */
export const formatDateTime = (isoDate: string, style: 'short' | 'full' | 'long' | 'medium' = 'long'): string => {
  if (!isoDate) return ''
  return new Date(isoDate).toLocaleString('en-gb', { dateStyle: style, timeStyle: style })
}
