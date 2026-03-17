import type { Request, Response } from 'express'
import logger from '../../logger'
import productService from '../services/productConfigurations'

export default class HomepageController {
  static async getHomepage(req: Request, res: Response) {
    logger.info('rendering homepage')

    let products: Product[]
    let suspendedProducts: Product[]
    let error: string
    try {
      products = await productService.getProductList(req)
      suspendedProducts = products.filter(p => p.suspended)
    } catch (err) {
      logger.error(`error getting product list from API ${err.message}`)
      error = 'Unexpected error getting products list from API'
    }

    res.render('pages/homepage', {
      error,
      suspendedProducts,
      hasSarUserRole: res.locals.user.userRoles.includes('SAR_USER_ACCESS'),
      hasAdminRole: res.locals.user.userRoles.includes('SAR_ADMIN_ACCESS'),
      hasRegisterTemplateRole: res.locals.user.userRoles.includes('SAR_REGISTER_TEMPLATE'),
    })
  }
}
