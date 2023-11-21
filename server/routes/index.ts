import { type RequestHandler, Router } from 'express'

import axios from 'axios'
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
  const url = ''
  const servicelist = getServices(url)

  get('/serviceselection', (req, res, next) => {
    res.render('pages/serviceselection', servicelist)
    /* pass services list */
  })

  return router
}

/* function callApi:
make get request to API
return list of services */

async function getServices(apiurl: string) {
  try {
    const response = await axios.get(apiurl)
    // Handle the response
  } catch (error) {
    // Handle the error
  }
}
