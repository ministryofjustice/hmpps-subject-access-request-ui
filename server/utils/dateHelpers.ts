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
const formatDate = (isoDate: string, style: 'short' | 'full' | 'long' | 'medium' = 'long'): string => {
  if (!isoDate) return ''
  return new Date(isoDate).toLocaleDateString('en-gb', { dateStyle: style })
}

export default formatDate
