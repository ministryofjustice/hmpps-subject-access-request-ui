import type { Request, Response } from 'express'
import ConfirmationController from './confirmationController'

afterEach(() => {
  jest.resetAllMocks()
})

describe('getConfirmation', () => {
  // @ts-expect-error stubbing res.render
  const res: Response = {
    render: jest.fn(),
  }

  test('renders a response with session data', async () => {
    const req: Request = {
      // @ts-expect-error stubbing session
      session: {
        userData: {
          caseReference: 'ExampleCaseReference',
        },
      },
    }

    await ConfirmationController.getConfirmation(req, res)

    expect(res.render).toHaveBeenCalled()
    expect(res.render).toBeCalledWith(
      'pages/confirmation',
      expect.objectContaining({
        caseReference: 'ExampleCaseReference',
      }),
    )
  })

  test('clears user data from session', async () => {
    const req: Request = {
      // @ts-expect-error stubbing session
      session: {
        userData: {
          caseReference: 'ExampleCaseReference',
        },
        selectedList: [{ id: '1', text: 'service1' }],
      },
    }

    await ConfirmationController.getConfirmation(req, res)

    expect(req.session.userData).toEqual({})
    expect(req.session.selectedList).toEqual([])
  })
})
