import { type RequestHandler, Router } from 'express'
import superagent from 'superagent'
import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function routes(service: Services): Router {
  const router = Router()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/', (req, res, next) => {
    res.render('pages/index')
  })

  /* call function callApi, return services list */
  const url = 'http://localhost:1337/products'
  /* const servicelist = getServices(url) */

  get('/serviceselection', (req, res, next) => {
    const list = getServices(url)
    res.render('pages/serviceselection', {
      servicelist: list,
      responseJson: JSON.stringify(list),
    })
    /* pass services list */
  })

  return router
}

/* function callApi:
make get request to API
return list of services */

function getServices(apiurl: string): Promise<superagent.Response> {
  return superagent.get(apiurl).set('Authorization', 'randomApiToken')
  // Handle the response
}
// Handle the error
