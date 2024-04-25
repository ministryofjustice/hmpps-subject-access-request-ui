const proxy = require('express-http-proxy')
import config from '../config'
import { UUID } from 'crypto'
import type { NextFunction, Request, Response } from 'express'

const getReport = (apiUrl: any) => {
    return {

      files: {
        getRaw: (
        req: Request,
        res: Response,
        next: NextFunction,
        //skipToNextHandlerFilter: Handler,
        fileId: UUID
      ) =>
        proxy(apiUrl, {
          proxyReqOptDecorator: proxyReqOpts => {
            proxyReqOpts.headers.Authorization = `Bearer ${req.user.token}`
            return proxyReqOpts
          },
          proxyReqPathResolver: () => {
            console.log(fileId.toString())
            console.log(req.query.id)
            console.log(encodeURI(`/api/report?id=039bfe3a-20ae-46a5-8686-53ba432743bb`))
            return `/api/report?id=039bfe3a-20ae-46a5-8686-53ba432743bb`
          },
          //skipToNextHandlerFilter
          
        })(req, res, next)
    },
    }
  }
  const defaultService = getReport(config.apis.subjectAccessRequest.url)
  module.exports = {
    ...defaultService,
    getReport
  }