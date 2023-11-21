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

describe('inputsController', () => {
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
