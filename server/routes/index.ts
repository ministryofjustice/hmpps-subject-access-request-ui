import { type RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import formatDate from '../utils/dateHelpers'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function routes(service: Services): Router {
  const router = Router()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string | string[], handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get('/', (req, res, next) => {
    res.render('pages/index')
  })

  // --- option 1 ---

  get('/inputs', (req, res, next) => {
    res.render('pages/inputs', {
      today: formatDate(new Date().toISOString(), 'short'),
    })
  })

  post('/get-input', (req, res, next) => {
    req.session.userData = {
      dateFrom: req.body.dateFrom,
      dateTo: req.body.dateTo,
      caseReference: req.body.caseReference,
    }
    res.redirect('/services')
  })

  get('/services', (req, res, next) => {
    res.render('pages/inputs', {
      today: formatDate(new Date().toISOString(), 'short'),
    })
  })

  return router
}
