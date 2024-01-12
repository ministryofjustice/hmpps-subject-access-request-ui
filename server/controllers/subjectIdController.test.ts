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
    describe('when the subject ID that was previously entered was a NOMIS ID', () => {
      test('renders a response with subject ID populated', () => {
        const req: Request = {
          // @ts-expect-error stubbing session
          session: {
            userData: {
              nomisId: 'A1111AA',
            },
          },
        }

        SubjectIdController.getSubjectId(req, res)
        expect(res.render).toBeCalledWith(
          'pages/subjectid',
          expect.objectContaining({
            subjectId: req.session.userData.nomisId,
          }),
        )
      })
    })
  })

  describe('when the subject ID that was previously entered was a nDelius ID', () => {
    test('renders a response with subject ID populated', () => {
      const req: Request = {
        // @ts-expect-error stubbing session
        session: {
          userData: {
            ndeliusId: 'A1111AA',
          },
        },
      }

      SubjectIdController.getSubjectId(req, res)
      expect(res.render).toBeCalledWith(
        'pages/subjectid',
        expect.objectContaining({
          subjectId: req.session.userData.ndeliusId,
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
    describe('when the subject ID is a NOMIS ID', () => {
      const baseReqWithNomisId: Request = {
        // @ts-expect-error stubbing session
        session: {
          userData: {},
        },
        body: {
          subjectId: 'A1111AA',
        },
      }

      test('saves as nomisId', () => {
        SubjectIdController.saveSubjectId(baseReqWithNomisId, res)
        expect(baseReqWithNomisId.session.userData.nomisId).toBe('A1111AA')
      })

      test('redirects to the next page in the user journey', () => {
        SubjectIdController.saveSubjectId(baseReqWithNomisId, res)
        expect(res.redirect).toHaveBeenCalled()
        expect(res.redirect).toBeCalledWith('/inputs')
      })

      describe('when a user has already provided a subject ID in the session', () => {
        test('overwrites NOMIS ID if previous subject ID was a NOMIS ID', () => {
          const req: Request = {
            ...baseReqWithNomisId,
            // @ts-expect-error stubbing session
            session: {
              userData: {
                nomisId: 'Z9999ZZ',
              },
            },
          }
          SubjectIdController.saveSubjectId(req, res)
          expect(req.session.userData.nomisId).toBe('A1111AA')
          expect(req.session.userData.ndeliusId).toBe(null)
          expect(res.redirect).toHaveBeenCalled()
          expect(res.redirect).toBeCalledWith('/inputs')
        })

        test('saves new NOMIS ID and discards old nDelius ID if previous subject ID was a nDelius ID', () => {
          const req: Request = {
            ...baseReqWithNomisId,
            // @ts-expect-error stubbing session
            session: {
              userData: {
                nDelius: 'Z999999',
              },
            },
          }
          SubjectIdController.saveSubjectId(req, res)
          expect(req.session.userData.nomisId).toBe('A1111AA')
          expect(req.session.userData.ndeliusId).toBe(null)
          expect(res.redirect).toHaveBeenCalled()
          expect(res.redirect).toBeCalledWith('/inputs')
        })
      })
    })

    describe('when the subject ID is a nDelius ID', () => {
      const baseReqWithNdeliusId: Request = {
        // @ts-expect-error stubbing session
        session: {
          userData: {},
        },
        body: {
          subjectId: 'A111111',
        },
      }
      test('saves as ndeliusId', () => {
        SubjectIdController.saveSubjectId(baseReqWithNdeliusId, res)
        expect(baseReqWithNdeliusId.session.userData.ndeliusId).toBe('A111111')
      })

      test('redirects to the next page in the user journey', () => {
        SubjectIdController.saveSubjectId(baseReqWithNdeliusId, res)
        expect(res.redirect).toHaveBeenCalled()
        expect(res.redirect).toBeCalledWith('/inputs')
      })

      describe('when a user has already provided a subject ID in the session', () => {
        test('overwrites nDelius ID if previous subject ID was a nDelius ID', () => {
          const req: Request = {
            ...baseReqWithNdeliusId,
            // @ts-expect-error stubbing session
            session: {
              userData: {
                ndeiusId: 'Z999999',
              },
            },
          }
          SubjectIdController.saveSubjectId(req, res)
          expect(req.session.userData.ndeliusId).toBe('A111111')
          expect(req.session.userData.nomisId).toBe(null)
          expect(res.redirect).toHaveBeenCalled()
          expect(res.redirect).toBeCalledWith('/inputs')
        })

        test('saves new nDelius ID and discards old NOMIS ID if previous subject ID was a NOMIS ID', () => {
          const req: Request = {
            ...baseReqWithNdeliusId,
            // @ts-expect-error stubbing session
            session: {
              userData: {
                nomisId: 'Z9999ZZ',
              },
            },
          }
          SubjectIdController.saveSubjectId(req, res)
          expect(req.session.userData.ndeliusId).toBe('A111111')
          expect(req.session.userData.nomisId).toBe(null)
          expect(res.redirect).toHaveBeenCalled()
          expect(res.redirect).toBeCalledWith('/inputs')
        })
      })
    })
  })

  describe('when an invalid Subject ID is provided', () => {
    const baseReqWithInvalidId: Request = {
      // @ts-expect-error stubbing session
      session: {
        userData: {},
      },
      body: {
        subjectId: 'invalid-subject-id',
      },
    }

    test('user is returned to the subject ID page', () => {
      SubjectIdController.saveSubjectId(baseReqWithInvalidId, res)
      expect(res.render).toBeCalledWith(
        'pages/subjectid',
        expect.objectContaining({
          subjectId: baseReqWithInvalidId.body.subjectId,
        }),
      )
    })

    test('user receives an invalid subject ID error', () => {
      SubjectIdController.saveSubjectId(baseReqWithInvalidId, res)
      expect(res.render).toBeCalledWith(
        'pages/subjectid',
        expect.objectContaining({
          subjectIdError: 'Subject ID must be a NOMIS prisoner number or nDelius case reference number',
        }),
      )
    })
  })
})
