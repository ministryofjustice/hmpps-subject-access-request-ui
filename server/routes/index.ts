import { type RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import { formatDate } from '../utils/dateHelpers'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function routes(service: Services): Router {
  const router = Router()
  const now = new Date()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string | string[], handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get('/', (req, res, next) => {
    res.render('pages/index')
  })

  // --- option 1 ---

  get('/inputs', (req, res, next) => {
    console.log('/INPUTS CALLED')
    console.log(req.session)
    res.render('pages/inputs', {
      today: formatDate(now.toISOString(), 'short'),
    })
  })

  post('/get-input', (req, res, next) => {
    console.log('/GET-INPUT CALLED')
    console.log(req.session)
    req.session.userData = {
      dateFrom: req.body.dateFrom,
      dateTo: req.body.dateTo,
      caseReference: req.body.caseReference,
    }
    // -- put inputs in session store
    // -- redirect user to /service
    res.redirect('/services')
  })

  get('/services', (req, res, next) => {
    console.log('/SERVICES CALLED')
    console.log(req.session)
    res.render('pages/inputs', {
      today: formatDate(now.toISOString(), 'short'),
    })
  })

  return router
}
