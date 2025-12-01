import ValidationError from '../utils/validationError'

export default class InputsValidation {
  static MAX_CASEREFERENCE_LENGTH = 20

  static validateDateRange(dateFrom: string, dateTo: string): { dateFromError: string; dateToError: string } {
    const { validationError: dateFromError, parsedDate: dateFromDate } = this.validateDateString(dateFrom, 'Date From')
    const { validationError: interimToError, parsedDate: dateToDate } = this.validateDateString(dateTo, 'Date To', true)

    let dateToError = interimToError
    if (dateFromDate && dateToDate && dateFromDate > dateToDate) {
      dateToError = `Date To must be after Date From`
    }

    return { dateFromError, dateToError }
  }

  static validateDateString(
    inputDate: string,
    fieldName: string,
    isMandatory: boolean = false,
  ): { validationError: string; parsedDate: Date } {
    if (!inputDate) {
      if (isMandatory) {
        return {
          validationError: `${fieldName} must be provided (default value of today has been prefilled)`,
          parsedDate: null,
        }
      }
      // optional parameter - if blank no error
      return { validationError: '', parsedDate: null }
    }
    try {
      const parsedDate = this.validateAndParseDateString(inputDate, fieldName)
      return { validationError: '', parsedDate }
    } catch (e) {
      return { validationError: e.message, parsedDate: null }
    }
  }

  static validateAndParseDateString(inputDate: string, fieldName: string): Date {
    // Validate that it consists of a string with exactly 2 slashes
    if (inputDate.replace(/[^/]/g, '').length !== 2) {
      throw new ValidationError(`${fieldName} must be in the format dd/mm/yyyy`)
    }
    // Validate that day, month and year are all numerical and return the date
    const [dateDayString, dateMonthString, dateYearString] = inputDate.split('/')
    let dateDay
    let dateMonth
    let dateYear
    try {
      dateDay = parseInt(dateDayString, 10)
      dateMonth = parseInt(dateMonthString, 10)
      dateYear = parseInt(dateYearString, 10)
    } catch {
      throw new ValidationError(`${fieldName} must be in the format dd/mm/yyyy`)
    }
    // Validate that the input date matches the parsed date exactly
    // This test is useful to catch eg. out of range days/months
    const parsedDate = new Date(dateYear, dateMonth - 1, dateDay)
    if (parsedDate.toLocaleDateString('en-gb', { dateStyle: 'short' }) !== inputDate) {
      throw new ValidationError(`${fieldName} must be a valid date`)
    }
    // Validate that parsed date is not in the future
    if (parsedDate > new Date()) {
      throw new ValidationError(`${fieldName} must not be in the future`)
    }
    return parsedDate
  }

  static validateCaseReference(caseReference: string): string {
    try {
      // mandatory field - if blank, error
      if (!caseReference) {
        throw new ValidationError(`Enter Case Reference`)
      }
      // Validate that it doesn't exceed the max length
      if (caseReference.length > InputsValidation.MAX_CASEREFERENCE_LENGTH) {
        throw new ValidationError(
          `Case Reference must be ${InputsValidation.MAX_CASEREFERENCE_LENGTH} characters or less`,
        )
      }
    } catch (e) {
      return e.message
    }
    return ''
  }
}
