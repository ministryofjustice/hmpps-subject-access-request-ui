export default class InputsValidation {
  static MAX_CASEREFERENCE_LENGTH = 20

  static validateDateFrom(dateFrom: string) {
    // optional parameter - if blank, no error
    if (!dateFrom) {
      return ''
    }
    // Validate that it consists of a day, month and year
    const [dayString, monthString, yearString] = dateFrom.split('/')
    if (!dayString || !monthString || !yearString) {
      return `Date From must be in the format dd/mm/yyyy`
    }
    // Validate that day, month and year are all numerical
    let day
    let month
    let year
    try {
      day = parseInt(dayString, 10)
      month = parseInt(monthString, 10)
      year = parseInt(yearString, 10)
    } catch (e) {
      return `Date From must be in the format dd/mm/yyyy`
    }
    // Validate that the input date matches the parsed date exactly
    // This test is useful to catch eg. out of range days/months
    const inputDateFrom = new Date(year, month - 1, day)
    if (inputDateFrom.toLocaleDateString('en-gb', { dateStyle: 'short' }) !== dateFrom) {
      return `Date From must be a valid date`
    }
    // Validate that the input date is not in the future
    if (inputDateFrom > new Date()) {
      return `Date From must not be in the future`
    }
    return ``
  }

  static validateDateTo(dateTo: string, dateFrom: string) {
    // optional parameter - if blank, no error
    if (!dateTo) {
      return ''
    }
    // Validate that it consists of a day, month and year
    const [dayString, monthString, yearString] = dateTo.split('/')
    if (!dayString || !monthString || !yearString) {
      return `Date To must be in the format dd/mm/yyyy`
    }
    // Validate that day, month and year are all numerical
    let day
    let month
    let year
    try {
      day = parseInt(dayString, 10)
      month = parseInt(monthString, 10)
      year = parseInt(yearString, 10)
    } catch (e) {
      return `Date To must be in the format dd/mm/yyyy`
    }
    // Validate that the input date matches the parsed date exactly
    // This test is useful to catch eg. out of range days/months
    const inputDateTo = new Date(year, month - 1, day)
    if (inputDateTo.toLocaleDateString('en-gb', { dateStyle: 'short' }) !== dateTo) {
      return `Date To must be a valid date`
    }
    // Validate that the input date is not in the future
    if (inputDateTo > new Date()) {
      return `Date To must not be in the future`
    }
    // Validate that dateTo is after dateFrom (dateFrom has already been validated if present)
    if (!dateFrom) {
      return ``
    }
    const [dateFromDayString, dateFromMonthString, dateFromYearString] = dateFrom.split('/')
    let dateFromDay
    let dateFromMonth
    let dateFromYear
    try {
      dateFromDay = parseInt(dateFromDayString, 10)
      dateFromMonth = parseInt(dateFromMonthString, 10)
      dateFromYear = parseInt(dateFromYearString, 10)
    } catch (e) {
      return ``
    }
    if (new Date(dateFromYear, dateFromMonth - 1, dateFromDay) > inputDateTo) {
      return `Date To must be after Date From`
    }
    return ``
  }

  static validateCaseReference(caseReference: string): string {
    // mandatory field - if blank, error
    if (!caseReference) {
      return `Enter Case Reference`
    }
    // Validate that it doesn't exceed the max length
    if (caseReference.length > InputsValidation.MAX_CASEREFERENCE_LENGTH) {
      return `Case Reference must be ${InputsValidation.MAX_CASEREFERENCE_LENGTH} characters or less`
    }
    return ''
  }
}
