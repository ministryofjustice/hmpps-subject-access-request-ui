import { UUID } from 'crypto'
import type { NextFunction, Request, Response } from 'express'

const proxy = require('express-http-proxy')
const config = require('../config')

const getReport = (apiUrl: string) => {
  return {
    files: {
      getRaw: (req: Request, res: Response, next: NextFunction, fileId: UUID) =>
        proxy(apiUrl, {
          // eslint-disable-next-line  @typescript-eslint/no-explicit-any
          proxyReqOptDecorator: (proxyReqOpts: any) => {
            // eslint-disable-next-line  no-param-reassign
            proxyReqOpts.headers.Authorization = `Bearer ${req.user.token}`
            return proxyReqOpts
          },
          proxyReqPathResolver: () => {
            return `/api/report?id=${fileId}`
          },
        })(req, res, next),
    },
  }
}
const defaultService = getReport(config.apis.subjectAccessRequest.url)
module.exports = {
  ...defaultService,
  getReport,
}
