import type { Request, Response } from 'express'
import productService from '../../services/productConfigurations'

export default class AdminProductConfigController {
  static async getProductConfigSummary(req: Request, res: Response) {
    const products = await productService.getProductList(req)
    req.session.productList = products

    res.render('pages/admin/adminProductConfig', {
      products,
    })
  }
}
