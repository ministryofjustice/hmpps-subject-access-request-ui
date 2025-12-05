import { Request, Response } from 'express'
import ProductSelectionValidation from './productSelectionValidation'
import productConfigsService from '../services/productConfigurations'

export default class RegisterTemplateProductController {
  static async getProducts(req: Request, res: Response) {
    const productList = await productConfigsService.getTemplateRegistrationProductList(req)

    if (productList.length === 0) {
      res.render('pages/registerTemplate/selectProduct', {
        selectedProductError: 'No products found. A template cannot be registered.',
        productList,
      })
      return
    }

    req.session.productList = productList

    res.render('pages/registerTemplate/selectProduct', {
      productList,
    })
  }

  static selectProduct(req: Request, res: Response) {
    const { productList } = req.session
    const selectedProduct = req.body.product
    const selectedProductError = ProductSelectionValidation.validateSingleSelection(selectedProduct, productList)
    if (selectedProductError) {
      res.render('pages/registerTemplate/selectProduct', {
        selectedProductError,
        productList,
      })
      return
    }
    req.session.selectedProduct = productList.find(product => selectedProduct === product.id)
    res.redirect('/register-template/upload')
  }
}
