import { jwtDecode } from 'jwt-decode'
import type { RequestHandler } from 'express'

import logger from '../../logger'
import asyncMiddleware from './asyncMiddleware'

enum AuthRole {
  SAR_ADMIN_ACCESS = 'ROLE_SAR_ADMIN_ACCESS',
  SAR_REGISTER_TEMPLATE = 'ROLE_SAR_REGISTER_TEMPLATE',
}

const authorisationMap = {
  '/admin': [AuthRole.SAR_ADMIN_ACCESS],
  '/admin/details': [AuthRole.SAR_ADMIN_ACCESS],
  '/register-template/': [AuthRole.SAR_REGISTER_TEMPLATE],
}

export default function authorisationMiddleware(authorisedRoles: string[] = []): RequestHandler {
  return asyncMiddleware((req, res, next) => {
    if (res.locals?.user?.token) {
      const { authorities: roles = [] } = jwtDecode(res.locals.user.token) as { authorities?: string[] }

      try {
        if (authorisedRoles.length && !roles.some(role => authorisedRoles.includes(role))) {
          throw Error('User is not authorised to access this')
        }

        Object.entries(authorisationMap).forEach(([urlMatch, authorisationMapRoles]) => {
          if (req.originalUrl.includes(urlMatch)) {
            const accessAllowed = authorisationMapRoles.filter(authorisedRole => roles.includes(authorisedRole))
            if (accessAllowed.length === 0) {
              throw Error(`User is not authorised to access ${urlMatch} page`)
            }
          }
        })
      } catch (e) {
        logger.error(e.message)
        return res.redirect('/authError')
      }
      return next()
    }

    req.session.returnTo = req.originalUrl
    return res.redirect('/sign-in')
  })
}
