import { Request, Response } from 'express'
import ProductSelectionValidation from './productSelectionValidation'
import { dataAccess } from '../data'
import productConfigsService from '../services/productConfigurations'

export default class ProductSelectionController {
  static async getProducts(req: Request, res: Response) {
    const productList = await productConfigsService.getProductList(req)

    if (productList.length === 0) {
      res.render('pages/productSelection', {
        selectedProductsError: `No products found. A report cannot be generated.`,
        productList,
        buttonText: 'Confirm',
      })
      return
    }

    req.session.productList = productList
    const selectedList = req.session.selectedList ?? []
    const hasAllAnswers = req.session.selectedList && req.session.selectedList.length !== 0
    if (hasAllAnswers) {
      res.render('pages/productSelection', {
        productList,
        selectedList: selectedList.map(x => x.name),
        buttonText: 'Confirm and return to summary page',
      })
      return
    }

    res.render('pages/productSelection', {
      productList,
      selectedList: selectedList.map(x => x.name),
      buttonText: 'Confirm',
    })
  }

  static selectProducts(req: Request, res: Response) {
    const { productList } = req.session
    const selectedList: string[] = []
    if (dataAccess().telemetryClient) {
      dataAccess().telemetryClient.trackEvent({
        name: 'selectProducts',
        properties: { id: req.session.selectedList },
      })
    }
    if (productList) {
      if (Array.isArray(req.body.selectedProducts)) selectedList.push(...req.body.selectedProducts)
      else if (req.body.selectedProducts) selectedList.push(req.body.selectedProducts)

      const selectedProductsError = ProductSelectionValidation.validateSelection(selectedList, productList)
      if (selectedProductsError) {
        res.render('pages/productSelection', {
          selectedProductsError,
          productList,
          buttonText: 'Confirm',
        })
        return
      }
      req.session.selectedList = productList.filter(x => selectedList.includes(x.name.toString()))
      res.redirect('/summary')
    }
  }
}
