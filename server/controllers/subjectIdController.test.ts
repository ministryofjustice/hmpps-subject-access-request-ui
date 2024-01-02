import type { Request, Response } from 'express'
import SubjectIdController from './subjectIdController'

afterEach(() => {
  jest.resetAllMocks()
})

describe('getSubjectId', () => {
  // @ts-expect-error stubbing res.render
  const res: Response = {
    render: jest.fn(),
  }

  describe('when a user starts a new flow', () => {
    test('renders a response with no subject ID', () => {
      const req: Request = {
        // @ts-expect-error stubbing session
        session: {},
      }

      SubjectIdController.getSubjectId(req, res)
      expect(res.render).toBeCalledWith(
        'pages/subjectid',
        expect.objectContaining({
          subjectId: undefined,
        }),
      )
    })
  })

  describe('when a user returns within a session', () => {
    test('renders a response with subject ID entered previously in session', () => {
      const req: Request = {
        // @ts-expect-error stubbing session
        session: {
          userData: {
            subjectId: 'A1111AA',
          },
        },
      }

      SubjectIdController.getSubjectId(req, res)
      expect(res.render).toBeCalledWith(
        'pages/subjectid',
        expect.objectContaining({
          subjectId: req.session.userData.subjectId,
        }),
      )
    })
  })
})

describe('saveSubjectId', () => {
  const baseReq: Request = {
    // @ts-expect-error stubbing session
    session: {
      userData: {},
    },
    body: {
      subjectId: 'A1111AA',
    },
  }

  // @ts-expect-error stubbing res.render
  const res: Response = {
    redirect: jest.fn(),
  }

  test('persists values to the session', () => {
    SubjectIdController.saveSubjectId(baseReq, res)
    expect(baseReq.session.userData.subjectId).toBe('A1111AA')
  })

  test('redirects to the next page in the user journey', () => {
    SubjectIdController.saveSubjectId(baseReq, res)
    expect(res.redirect).toHaveBeenCalled()
    expect(res.redirect).toBeCalledWith('/inputs')
  })

  test('overwrites previous session data if present', () => {
    const req: Request = {
      ...baseReq,
      // @ts-expect-error stubbing session
      session: {
        userData: {
          subjectId: 'subjectIdToBeOverwritten',
        },
      },
    }
    SubjectIdController.saveSubjectId(req, res)
    expect(req.session.userData.subjectId).toBe('A1111AA')
    expect(res.redirect).toHaveBeenCalled()
    expect(res.redirect).toBeCalledWith('/inputs')
  })
})
