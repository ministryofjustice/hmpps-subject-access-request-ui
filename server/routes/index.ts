import { type RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import { formatDate } from '../utils/dateHelpers'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function routes(service: Services): Router {
  const router = Router()
  const now = new Date()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/', (req, res, next) => {
    res.render('pages/index')
  })

  get('/inputs', (req, res, next) => {
    res.render('pages/inputs', {
      today: formatDate(now.toISOString(), 'short'),
      now: now.getHours().toString(),
    })
  })

  return router
}
