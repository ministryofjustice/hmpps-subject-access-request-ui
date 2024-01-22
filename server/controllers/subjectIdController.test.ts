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
    test('renders a response with subject ID populated', () => {
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
  // @ts-expect-error stubbing res.render
  const res: Response = {
    redirect: jest.fn(),
    render: jest.fn(),
  }

  describe('when a valid Subject ID is provided', () => {
    const baseReq: Request = {
      // @ts-expect-error stubbing session
      session: {
        userData: {},
      },
      body: {
        subjectId: 'A1111AA',
      },
    }

    test('saves to session', () => {
      SubjectIdController.saveSubjectId(baseReq, res)
      expect(baseReq.session.userData.subjectId).toBe('A1111AA')
    })

    test('redirects to the next page in the user journey', () => {
      SubjectIdController.saveSubjectId(baseReq, res)
      expect(res.redirect).toHaveBeenCalled()
      expect(res.redirect).toBeCalledWith('/inputs')
    })

    describe('when a user has already provided a subject ID in the session', () => {
      test('overwrites previous subject ID', () => {
        const req: Request = {
          ...baseReq,
          // @ts-expect-error stubbing session
          session: {
            userData: {
              subjectId: 'Z9999ZZ',
            },
          },
        }
        SubjectIdController.saveSubjectId(req, res)
        expect(req.session.userData.subjectId).toBe('A1111AA')
        expect(res.redirect).toHaveBeenCalled()
        expect(res.redirect).toBeCalledWith('/inputs')
      })

      test('redirects to summary if all answers have been provided', () => {
        const req: Request = {
          // @ts-expect-error stubbing session
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
            subjectId: 'A1111AA',
          },
        }

        SubjectIdController.saveSubjectId(req, res)
        expect(res.redirect).toHaveBeenCalled()
        expect(res.redirect).toBeCalledWith('/summary')
      })
    })
  })
  describe('when an invalid Subject ID is provided', () => {
    const baseReq: Request = {
      // @ts-expect-error stubbing session
      session: {
        userData: {},
      },
      body: {
        subjectId: 'invalid-subject-id',
      },
    }

    test('user is returned to the subject ID page', () => {
      SubjectIdController.saveSubjectId(baseReq, res)
      expect(res.render).toBeCalledWith(
        'pages/subjectid',
        expect.objectContaining({
          subjectId: baseReq.body.subjectId,
        }),
      )
    })

    test('user receives an invalid subject ID error', () => {
      SubjectIdController.saveSubjectId(baseReq, res)
      expect(res.render).toBeCalledWith(
        'pages/subjectid',
        expect.objectContaining({
          subjectIdError: 'Subject ID must be a NOMIS prisoner number or nDelius case reference number',
        }),
      )
    })
  })
})
