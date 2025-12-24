import { Request, Response } from 'express'
import ProductSelectionValidation from './productSelectionValidation'
import { dataAccess } from '../data'
import productConfigsService from '../services/productConfigurations'
import ProductCategory from '../@types/productCategory'

export default class ProductSelectionController {
  static async getProducts(req: Request, res: Response) {
    const productList = await productConfigsService.getProductList(req)
    const categorisedProducts = ProductSelectionController.categoriseProducts(productList)

    if (productList.length === 0) {
      res.render('pages/productSelection', {
        selectedProductsError: `No products found. A report cannot be generated.`,
        categorisedProducts,
        buttonText: 'Confirm',
      })
      return
    }

    req.session.productList = productList
    const selectedList = req.session.selectedList ?? []
    const hasAllAnswers = req.session.selectedList && req.session.selectedList.length !== 0
    if (hasAllAnswers) {
      res.render('pages/productSelection', {
        categorisedProducts,
        selectedList: selectedList.map(x => x.name),
        buttonText: 'Confirm and return to summary page',
      })
      return
    }

    res.render('pages/productSelection', {
      categorisedProducts,
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
      const categorisedProducts = ProductSelectionController.categoriseProducts(productList)
      if (selectedProductsError) {
        res.render('pages/productSelection', {
          selectedProductsError,
          categorisedProducts,
          buttonText: 'Confirm',
        })
        return
      }
      req.session.selectedList = productList.filter(x => selectedList.includes(x.name.toString()))
      res.redirect('/summary')
    }
  }

  private static categoriseProducts(productList: Product[]) {
    const map = new Map<ProductCategory, Product[]>()
    productList.forEach(product => {
      if (!map.has(product.category)) {
        map.set(product.category, [])
      }
      map.get(product.category)!.push(product)
    })
    return Array.from(map, ([name, groupItems]) => ({ name, items: groupItems }))
  }
}
