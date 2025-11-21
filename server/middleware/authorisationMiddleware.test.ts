import jwt from 'jsonwebtoken'
import type { Request, Response } from 'express'

import authorisationMiddleware from './authorisationMiddleware'

function createToken(authorities: string[]) {
  const payload = {
    user_name: 'USER1',
    scope: ['read', 'write'],
    auth_source: 'nomis',
    authorities,
    jti: 'a610a10-cca6-41db-985f-e87efb303aaf',
    client_id: 'clientid',
  }

  return jwt.sign(payload, 'secret', { expiresIn: '1h' })
}

describe('authorisationMiddleware', () => {
  const req = { originalUrl: '/' } as Request
  const next = jest.fn()

  function createResWithToken({ authorities }: { authorities: string[] }): Response {
    return {
      locals: {
        user: {
          token: createToken(authorities),
        },
      },
      redirect: jest.fn(),
    } as unknown as Response
  }

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should return next when no required roles', () => {
    const res = createResWithToken({ authorities: [] })

    authorisationMiddleware()(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.redirect).not.toHaveBeenCalled()
  })

  it('should redirect when user has no authorised roles', () => {
    const res = createResWithToken({ authorities: [] })

    authorisationMiddleware(['SOME_REQUIRED_ROLE'])(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.redirect).toHaveBeenCalledWith('/authError')
  })

  it('should return next when user has authorised role', () => {
    const res = createResWithToken({ authorities: ['SOME_REQUIRED_ROLE'] })

    authorisationMiddleware(['SOME_REQUIRED_ROLE'])(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.redirect).not.toHaveBeenCalled()
  })

  it.each([
    '/admin',
    '/admin/details',
    '/register-template/select-service',
    '/register-template/upload',
    '/register-template/confirmation',
    '/register-template/result',
  ])('should redirect for %s when user has not got authorised role', page => {
    const reqForPage = { originalUrl: page } as Request
    const res = createResWithToken({ authorities: ['SOME_OTHER_ROLE'] })

    authorisationMiddleware(['SOME_OTHER_ROLE'])(reqForPage, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.redirect).toHaveBeenCalledWith('/authError')
  })

  it.each([
    { page: '/admin', role: 'ROLE_SAR_ADMIN_ACCESS' },
    { page: '/admin/details', role: 'ROLE_SAR_ADMIN_ACCESS' },
    { page: '/register-template/select-service', role: 'ROLE_SAR_REGISTER_TEMPLATE' },
    { page: '/register-template/upload', role: 'ROLE_SAR_REGISTER_TEMPLATE' },
    { page: '/register-template/confirmation', role: 'ROLE_SAR_REGISTER_TEMPLATE' },
    { page: '/register-template/result', role: 'ROLE_SAR_REGISTER_TEMPLATE' },
  ])('should return next for %s when user has authorised role', ({ page, role }) => {
    const reqForPage = { originalUrl: page } as Request
    const res = createResWithToken({ authorities: [role] })

    authorisationMiddleware([role])(reqForPage, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.redirect).not.toHaveBeenCalled()
  })
})
