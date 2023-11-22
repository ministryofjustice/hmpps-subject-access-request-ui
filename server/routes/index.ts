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
    getServices(url).end((error, result) => {
      const list = result.text
      res.render('pages/serviceselection', {
        servicelist: list,
      })
    })
  })

  return router
}

function getServices(apiurl: string) {
  return superagent.get(apiurl).set('Authorization', 'OAuth randomApiToken')
}
