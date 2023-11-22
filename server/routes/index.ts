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
      if (error) {
        const list = [
          {
            value: 'Select All',
            text: 'Select All',
          },
          {
            divider: 'or',
          },
          { text: 'Data from TestService1', value: 'https://foo.boo.com' },
          { text: 'Data from TestService2', value: 'https://foo.boo.com' },
          { text: 'Data from TestService3', value: 'https://foo.boo.com' },
        ]
        res.render('pages/serviceselection', {
          servicelist: list,
        })
      } else {
        // TODO: implement logic to get list of service from Service Catalogue response
      }
    })
  })

  return router
}

function getServices(apiurl: string) {
  return superagent.get(apiurl).set('Authorization', 'OAuth randomApiToken')
}
