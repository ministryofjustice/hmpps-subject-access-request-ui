import type { NextFunction, Request, Response } from 'express'
import proxy from 'express-http-proxy'
import config from '../config'

export default (req: Request, res: Response, next: NextFunction, fileId: string) =>
  proxy(config.apis.subjectAccessRequest.url, {
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    proxyReqOptDecorator: (proxyReqOpts: any) => {
      // eslint-disable-next-line  no-param-reassign
      proxyReqOpts.headers.Authorization = `Bearer ${req.user.token}`
      return proxyReqOpts
    },
    proxyReqPathResolver: () => {
      return `/api/report?id=${fileId}`
    },
    limit: '10mb',
  })(req, res, next)
