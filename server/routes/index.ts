import { type RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import InputsController from '../controllers/inputsController'
import ServiceSelectionController from '../controllers/serviceSelectionController'
import SummaryController from '../controllers/summaryController'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function routes(service: Services): Router {
  const router = Router()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string | string[], handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get('/', (req, res, next) => {
    res.render('pages/index')
  })

  get('/inputs', InputsController.getInputs)
  post('/inputs', InputsController.saveInputs)

  get('/summary', SummaryController.getReportDetails)

  get('/serviceselection', ServiceSelectionController.getServices)

  router.post('/serviceselection', ServiceSelectionController.selectServices)

  get('/confirmation', (req, res, next) => {
    res.render('pages/confirmation')
  })

  return router
}
