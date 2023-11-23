import type { Request, Response } from 'express'

import InputsController from './inputsController'

const originalDate = global.Date

class MockDate extends Date {
  constructor() {
    super('2022-12-30T01:01:01.001Z')
  }
}

beforeEach(() => {
  // @ts-expect-error stubbing global date object
  global.Date = MockDate
})

afterEach(() => {
  jest.resetAllMocks()
  global.Date = originalDate
})

describe('getInputs', () => {
  // @ts-expect-error stubbing res.render
  const res: Response = {
    render: jest.fn(),
  }

  test('renders a response with default inputs', () => {
    const req: Request = {
      // @ts-expect-error stubbing session
      session: {},
    }
    InputsController.getInputs(req, res)
    expect(res.render).toHaveBeenCalled()
    expect(res.render).toBeCalledWith(
      'pages/inputs',
      expect.objectContaining({
        today: '30/12/2022',
        dateFrom: undefined,
        dateTo: expect.anything(),
        caseReference: undefined,
      }),
    )
  })
  test('renders a response with persisted values from previous session', () => {
    const req: Request = {
      // @ts-expect-error stubbing session
      session: {
        userData: {
          dateFrom: '01/01/2001',
          dateTo: '25/12/2022',
          caseReference: 'mockedCaseReference',
        },
      },
    }

    InputsController.getInputs(req, res)
    expect(res.render).toBeCalledWith(
      'pages/inputs',
      expect.objectContaining({
        today: '30/12/2022',
        dateFrom: req.session.userData.dateFrom,
        dateTo: req.session.userData.dateTo,
        caseReference: req.session.userData.caseReference,
      }),
    )
  })
})

describe('saveInputs', () => {
  const baseReq: Request = {
    // @ts-expect-error stubbing session
    session: {},
    body: {
      dateFrom: '30/12/2022',
      dateTo: '30/12/2022',
      caseReference: 'mockedCaseReference',
    },
  }
  // @ts-expect-error stubbing res
  const res: Response = {
    redirect: jest.fn(),
  }
  test('persists values to the session and redirects', () => {
    InputsController.saveInputs(baseReq, res)
    expect(baseReq.session.userData.dateFrom).toBe('30/12/2022')
    expect(baseReq.session.userData.dateTo).toBe('30/12/2022')
    expect(baseReq.session.userData.caseReference).toBe('mockedCaseReference')
    expect(res.redirect).toHaveBeenCalled()
    expect(res.redirect).toBeCalledWith('/services')
  })

  test('overwrites previous session data if present', () => {
    const req: Request = {
      ...baseReq,
      // @ts-expect-error stubbing session
      session: {
        userData: {
          dateFrom: '30/12/2021',
          dateTo: '30/12/2021',
          caseReference: 'caseReferenceToBeOverwritten',
        },
      },
    }
    InputsController.saveInputs(req, res)
    expect(req.session.userData.dateFrom).toBe('30/12/2022')
    expect(req.session.userData.dateTo).toBe('30/12/2022')
    expect(req.session.userData.caseReference).toBe('mockedCaseReference')
    expect(res.redirect).toHaveBeenCalled()
    expect(res.redirect).toBeCalledWith('/services')
  })
})

describe('validateDateFrom', () => {
  const errors = {
    format: 'Date From must be in the format dd/mm/yyyy',
    valid: 'Date From must be a valid date',
    future: 'Date From must not be in the future',
  }
  test('validates dateFrom value correctly', () => {
    const testCases = [
      { input: '', expected: '' },
      { input: '01/02/2002', expected: '' },
      { input: 'test', expected: errors.format },
      { input: '01/13/2022', expected: errors.valid },
      { input: '32/01/2022', expected: errors.valid },
      { input: '30/02/2023', expected: errors.valid },
      { input: 'a/01/2022', expected: errors.valid },
      { input: '01/a/2022', expected: errors.valid },
      { input: '01/01/a', expected: errors.valid },
      { input: '01/01/2150', expected: errors.future },
    ]
    testCases.forEach(testCase => {
      const actual = InputsController.validateDateFrom(testCase.input)
      expect(actual).toEqual(testCase.expected)
    })
  })
})

describe('validateDateTo', () => {
  const errors = {
    format: 'Date To must be in the format dd/mm/yyyy',
    valid: 'Date To must be a valid date',
    future: 'Date To must not be in the future',
    after: 'Date To must be after Date From',
  }
  test('validates dateFrom value correctly', () => {
    const testCases = [
      { inputTo: '', inputFrom: '', expected: '' },
      { inputTo: '01/02/2001', inputFrom: '', expected: '' },
      { inputTo: 'test', inputFrom: '', expected: errors.format },
      { inputTo: '01/13/2022', inputFrom: '', expected: errors.valid },
      { inputTo: '32/01/2022', inputFrom: '', expected: errors.valid },
      { inputTo: '30/02/2023', inputFrom: '', expected: errors.valid },
      { inputTo: 'a/01/2022', inputFrom: '', expected: errors.valid },
      { inputTo: '01/a/2022', inputFrom: '', expected: errors.valid },
      { inputTo: '01/01/a', inputFrom: '', expected: errors.valid },
      { inputTo: '01/01/2150', inputFrom: '', expected: errors.future },
      { inputTo: '01/01/2021', inputFrom: '01/01/2022', expected: errors.after },
    ]
    testCases.forEach(testCase => {
      const actual = InputsController.validateDateTo(testCase.inputTo, testCase.inputFrom)
      expect(actual).toEqual(testCase.expected)
    })
  })
})

describe('validateCaseReference', () => {
  const errors = {
    missing: 'Enter Case Reference',
    maxLength: 'Case Reference must be 20 characters or less',
  }
  test('validates caseReference value correctly', () => {
    const testCases = [
      { input: 'validReference', expected: '' },
      { input: '', expected: errors.missing },
      { input: 'invalidReferenceTooLong', expected: errors.maxLength },
    ]
    testCases.forEach(testCase => {
      const actual = InputsController.validateCaseReference(testCase.input)
      expect(actual).toEqual(testCase.expected)
    })
  })
})
