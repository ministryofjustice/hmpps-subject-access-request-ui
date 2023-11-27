import { type RequestHandler, Router } from 'express'
import ServiceCatalogueClient from '../data/serviceCatalogueClient'
import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import InputsController from '../controllers/inputsController'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function routes(service: Services): Router {
  const router = Router()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string | string[], handler: RequestHandler) => router.post(path, asyncMiddleware(handler))
  const catalogueclient = new ServiceCatalogueClient()

  get('/', (req, res, next) => {
    res.render('pages/index')
  })

  get('/inputs', InputsController.getInputs)
  post('/inputs', InputsController.saveInputs)

  get('/serviceselection', (req, res, next) => {
    // TODO: GetServiceToken
    catalogueclient.getServices('mockToken').then(list => {
      res.render('pages/serviceselection', {
        servicelist: list,
      })
    })
  })

  return router
}
