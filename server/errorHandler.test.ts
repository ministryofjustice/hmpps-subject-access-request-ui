import express, { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes } from './routes/testutils/appSetup'
import createErrorHandler from './errorHandler'
import logger from '../logger'

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({})
})

afterEach(() => {
  jest.restoreAllMocks()
  jest.resetAllMocks()
})

describe('GET 404', () => {
  it('should render content with stack in dev mode', () => {
    return request(app)
      .get('/unknown')
      .expect(404)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('NotFoundError: Not Found')
        expect(res.text).not.toContain('Something went wrong. The error has been logged. Please try again')
      })
  })

  it('should render content without stack in production mode', () => {
    return request(appWithAllRoutes({ production: true }))
      .get('/unknown')
      .expect(404)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Something went wrong. The error has been logged. Please try again')
        expect(res.text).not.toContain('NotFoundError: Not Found')
      })
  })
})

describe('error logging', () => {
  it.each([401, 403, 500])('logs only safe fields and preserves handling for status %s', async status => {
    const secret = 'synthetic-bearer-token'
    const error = Object.assign(new Error(`Bearer ${secret}`), {
      status,
      stack: `Error: ${secret}`,
      response: {
        req: { _header: `Authorization: Bearer ${secret}` },
        body: { access_token: secret },
      },
    })
    const logError = jest.spyOn(logger, 'error').mockImplementation()
    const errorHandlerApp = express()
    errorHandlerApp.get('/failure/:id', (req, res, next) => {
      jest.spyOn(res, 'render').mockImplementation(() => res.send('error page'))
      next(error)
    })
    errorHandlerApp.use(createErrorHandler(true))

    const response = await request(errorHandlerApp).get(`/failure/${secret}?access_token=${secret}`)

    expect(logError.mock.calls).toEqual([[{ method: 'GET', route: '/failure/:id', status }, 'Error handling request']])
    expect(JSON.stringify(logError.mock.calls)).not.toContain(secret)
    if (status === 401 || status === 403) {
      expect(response.status).toBe(302)
      expect(response.headers.location).toBe('/sign-out')
    } else {
      expect(response.status).toBe(500)
      expect(response.text).toBe('error page')
    }
  })
})
