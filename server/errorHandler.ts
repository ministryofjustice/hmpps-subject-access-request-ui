import type { Request, Response, NextFunction } from 'express'
import type { HTTPError } from 'superagent'
import logger from '../logger'
import errorLogFields from './utils/errorLogFields'

export default function createErrorHandler(production: boolean) {
  return (error: HTTPError, req: Request, res: Response, _: NextFunction): void => {
    logger.error({ method: req.method, route: req.route?.path, ...errorLogFields(error) }, 'Error handling request')

    if (error.status === 401 || error.status === 403) {
      logger.info('Logging user out')
      return res.redirect('/sign-out')
    }

    res.locals.message = production
      ? 'Something went wrong. The error has been logged. Please try again'
      : error.message
    res.locals.status = error.status
    res.locals.stack = production ? null : error.stack

    res.status(error.status || 500)

    return res.render('pages/error')
  }
}
