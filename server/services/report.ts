const proxy = require('express-http-proxy')
import config from '../config'
import { UUID } from 'crypto'
import type { NextFunction, Request, Response } from 'express'

const getReport = (apiUrl: string) => {
    return {

      files: {
        getRaw: (
        req: Request,
        res: Response,
        next: NextFunction,
        fileId: UUID,
      ) =>
        proxy(apiUrl, {
          proxyReqOptDecorator: (proxyReqOpts: any) => {
            proxyReqOpts.headers.Authorization = `Bearer ${req.user.token}`
            return proxyReqOpts
          },
          proxyReqPathResolver: () => {
            return `/api/report?id=${fileId}`
          },
          
        })(req, res, next)
    },
    }
  }
  const defaultService = getReport(config.apis.subjectAccessRequest.url)
  module.exports = {
    ...defaultService,
    getReport
  }