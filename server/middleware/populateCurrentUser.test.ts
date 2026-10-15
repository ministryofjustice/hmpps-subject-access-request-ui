import express from 'express'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { trace, telemetryMiddleware } from '@ministryofjustice/hmpps-azure-telemetry'
import type { UUID } from 'crypto'
import populateCurrentUser from './populateCurrentUser'
import type { AuthSource, BaseUser } from '../interfaces/hmppsUser'
import logger from '../../logger'

const userUuid: UUID = 'a610aa10-cca6-41db-985f-e87efb303aaf'

function createApp(authSource: AuthSource, claims: Record<string, unknown>, token?: string) {
  const app = express()
  app.use((req, res, next) => {
    const baseUser: Omit<BaseUser, 'authSource'> = {
      username: 'USER1',
      token: token ?? jwt.sign(claims, 'secret', { expiresIn: '1h' }),
      userId: '',
      name: '',
      displayName: '',
      userRoles: [],
    }
    res.locals.user = authSource === 'nomis' ? { ...baseUser, authSource, staffId: 0 } : { ...baseUser, authSource }
    next()
  })
  app.use(populateCurrentUser())
  app.use(telemetryMiddleware.addUserMetadataToTelemetry())
  app.get('/', (req, res) => res.json(res.locals.user))
  return app
}

describe('populateCurrentUser', () => {
  let setAttribute: jest.SpyInstance

  beforeEach(() => {
    const span = trace.wrapSpanContext({
      traceId: 'a610aa10cca641db985fe87efb303aaf00',
      spanId: 'a610aa10cca641db',
      traceFlags: 1,
    })
    setAttribute = jest.spyOn(span, 'setAttribute')
    jest.spyOn(trace, 'getActiveSpan').mockReturnValue(span)
    jest.spyOn(logger, 'error').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it.each<AuthSource>(['nomis', 'delius', 'external', 'azuread'])(
    'extracts the HMPPS Auth UUID for %s users and adds it to telemetry',
    async authSource => {
      const app = createApp(authSource, {
        name: 'FIRST LAST',
        user_id: '1234',
        user_uuid: userUuid,
        authorities: ['ROLE_SAR_USER_ACCESS'],
      })

      const response = await request(app).get('/').expect(200)

      expect(response.body).toMatchObject({
        username: 'USER1',
        authSource,
        userId: '1234',
        userUuid,
        name: 'FIRST LAST',
        displayName: 'First Last',
        userRoles: ['SAR_USER_ACCESS'],
      })
      if (authSource === 'nomis') {
        expect(response.body.staffId).toBe(1234)
      } else {
        expect(response.body).not.toHaveProperty('staffId')
      }
      expect(setAttribute.mock.calls).toEqual([
        ['userId', '1234'],
        ['userUuid', userUuid],
      ])
    },
  )

  it('preserves compatibility with tokens without a UUID or roles, without using a UUID fallback', async () => {
    const app = createApp('nomis', { name: 'FIRST LAST', user_id: '1234' })

    const response = await request(app).get('/').expect(200)

    expect(response.body).toMatchObject({
      username: 'USER1',
      userId: '1234',
      staffId: 1234,
      userRoles: [],
    })
    expect(response.body).not.toHaveProperty('userUuid')
    expect(setAttribute.mock.calls).toEqual([['userId', '1234']])
  })

  it('records the UUID independently of the auth-source-specific user ID', async () => {
    const app = createApp('external', { user_uuid: userUuid })

    const response = await request(app).get('/').expect(200)

    expect(response.body.userUuid).toBe(userUuid)
    expect(response.body).not.toHaveProperty('userId')
    expect(setAttribute.mock.calls).toEqual([['userUuid', userUuid]])
  })

  it('continues the request when telemetry has no active span', async () => {
    jest.spyOn(trace, 'getActiveSpan').mockReturnValue(undefined)
    const app = createApp('external', { user_uuid: userUuid })

    const response = await request(app).get('/').expect(200)

    expect(response.body.userUuid).toBe(userUuid)
    expect(setAttribute).not.toHaveBeenCalled()
  })

  it('logs and propagates invalid token errors without recording user metadata', async () => {
    const app = createApp('external', {}, 'invalid-token')
    const errorHandler = jest.fn<void, Parameters<express.ErrorRequestHandler>>((error, req, res, next) => {
      res.sendStatus(500)
    })
    app.use(errorHandler)

    await request(app).get('/').expect(500)

    expect(logger.error).toHaveBeenCalledWith(expect.any(Error), 'Failed to populate user details for: USER1')
    expect(errorHandler).toHaveBeenCalledWith(
      expect.any(Error),
      expect.anything(),
      expect.anything(),
      expect.anything(),
    )
    expect(setAttribute).not.toHaveBeenCalled()
  })
})
