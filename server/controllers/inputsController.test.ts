import type { Request, Response } from 'express'

import InputsController from './inputsController'

const originalDate = global.Date

class MockDate extends Date {
  constructor() {
    super('2022-12-30T12:01:01.001Z')
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
  const res: Response = {
    render: jest.fn(),
  } as unknown as Response

  test('renders a response with default inputs', () => {
    const req: Request = {
      session: {},
    } as unknown as Request
    InputsController.getInputs(req, res)
    expect(res.render).toHaveBeenCalled()
    expect(res.render).toHaveBeenCalledWith(
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
      session: {
        userData: {
          dateFrom: '01/01/2001',
          dateTo: '25/12/2022',
          caseReference: 'mockedCaseReference',
        },
      },
    } as unknown as Request

    InputsController.getInputs(req, res)
    expect(res.render).toHaveBeenCalledWith(
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
    session: {
      userData: {
        subjectId: 'A1111AA',
      },
    },
    body: {
      dateFrom: '30/12/2022',
      dateTo: '30/12/2022',
      caseReference: 'mockedCaseReference',
    },
  } as unknown as Request
  const res: Response = {
    redirect: jest.fn(),
  } as unknown as Response
  test('persists values to the session and redirects to product selection', () => {
    InputsController.saveInputs(baseReq, res)
    expect(baseReq.session.userData.dateFrom).toBe('30/12/2022')
    expect(baseReq.session.userData.dateTo).toBe('30/12/2022')
    expect(baseReq.session.userData.caseReference).toBe('mockedCaseReference')
    expect(res.redirect).toHaveBeenCalled()
    expect(res.redirect).toHaveBeenCalledWith('/product-selection')
  })

  test('overwrites previous session data if present', () => {
    const req: Request = {
      ...baseReq,
      session: {
        userData: {
          subjectId: 'A1111AA',
          dateFrom: '30/12/2021',
          dateTo: '30/12/2021',
          caseReference: 'caseReferenceToBeOverwritten',
        },
      },
    } as unknown as Request
    InputsController.saveInputs(req, res)
    expect(req.session.userData.dateFrom).toBe('30/12/2022')
    expect(req.session.userData.dateTo).toBe('30/12/2022')
    expect(req.session.userData.caseReference).toBe('mockedCaseReference')
    expect(res.redirect).toHaveBeenCalled()
    expect(res.redirect).toHaveBeenCalledWith('/product-selection')
  })

  test('redirects to summary if all answers have been provided', () => {
    const req: Request = {
      session: {
        userData: {
          subjectId: 'A1111AA',
          dateFrom: '01/01/2001',
          dateTo: '25/12/2022',
          caseReference: 'mockedCaseReference',
        },
        selectedList: [{ id: '1', text: 'service1' }],
      },
      body: {
        dateFrom: '30/12/2022',
        dateTo: '30/12/2022',
        caseReference: 'mockedCaseReference',
      },
    } as unknown as Request

    InputsController.saveInputs(req, res)
    expect(res.redirect).toHaveBeenCalled()
    expect(res.redirect).toHaveBeenCalledWith('/summary')
  })
})
