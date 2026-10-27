import express from 'express'
import passport from 'passport'
import request from 'supertest'
import setUpAuth from './setUpAuthentication'
import logger from '../../logger'

jest.mock('../authentication/auth', () => ({ init: jest.fn() }))
jest.mock('passport', () => ({
  initialize: () => (req: express.Request, res: express.Response, next: express.NextFunction) => next(),
  session: () => (req: express.Request, res: express.Response, next: express.NextFunction) => next(),
  authenticate: jest.fn(),
}))

describe('authentication error logging', () => {
  afterEach(() => jest.restoreAllMocks())

  function appWithCallback(error: Error | null, info?: object) {
    jest
      .mocked(passport.authenticate)
      .mockImplementation(
        (strategy: string, options: passport.AuthenticateOptions | passport.AuthenticateCallback) =>
          (req: express.Request, res: express.Response, next: express.NextFunction) => {
            if (typeof options === 'function') {
              options(error, false, info)
            } else {
              next()
            }
          },
      )
    const app = express()
    app.use(setUpAuth())
    return app
  }

  it('does not log OAuth error messages, stacks or nested token data', async () => {
    const secret = 'synthetic-oauth-token'
    const error = Object.assign(new Error(secret), {
      status: 403,
      code: 'invalid_grant',
      stack: secret,
      response: { body: { access_token: secret }, req: { _header: `Bearer ${secret}` } },
    })
    const logError = jest.spyOn(logger, 'error').mockImplementation()

    await request(appWithCallback(error)).get('/sign-in/callback').expect(302).expect('Location', '/autherror')

    expect(logError.mock.calls).toEqual([[{ status: 403 }, 'OAuth2 sign-in callback failed']])
    expect(JSON.stringify(logError.mock.calls)).not.toContain(secret)
  })

  it('does not log authentication failure details', async () => {
    const logWarn = jest.spyOn(logger, 'warn').mockImplementation()

    await request(appWithCallback(null, { code: 'access_denied', message: 'synthetic-oauth-token' }))
      .get('/sign-in/callback')
      .expect(302)
      .expect('Location', '/autherror')

    expect(logWarn.mock.calls).toEqual([[{}, 'OAuth2 authentication failed']])
  })

  it('handles missing authentication failure details', async () => {
    jest.spyOn(logger, 'warn').mockImplementation()

    await request(appWithCallback(null)).get('/sign-in/callback').expect(302).expect('Location', '/autherror')
  })

  it('preserves retrying authentication when the request state cannot be verified', async () => {
    const logWarn = jest.spyOn(logger, 'warn').mockImplementation()

    await request(appWithCallback(null, { message: 'Unable to verify authorization request state.' }))
      .get('/sign-in/callback')
      .expect(302)
      .expect('Location', '/')

    expect(logWarn).not.toHaveBeenCalled()
  })
})
