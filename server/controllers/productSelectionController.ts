import { Request, Response } from 'express'
import ProductSelectionValidation from './productSelectionValidation'
import { dataAccess } from '../data'
import productConfigsService from '../services/productConfigurations'
import ProductCategory from '../@types/productCategory'

const BACKLOG_PRODUCT_NAME = 'case notes - omic'

export default class ProductSelectionController {
  static async getProducts(req: Request, res: Response) {
    const productList = await productConfigsService.getProductList(req)
    const { backlogProducts, categorisedProducts } = ProductSelectionController.splitProducts(productList)

    if (productList.length === 0) {
      res.render('pages/productSelection', {
        selectedProductsError: `No products found. A report cannot be generated.`,
        backlogProducts,
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
        backlogProducts,
        categorisedProducts,
        selectedList: selectedList.map(x => x.name),
        suspendedProductsList: productList.filter((p: Product) => p.suspended),
        buttonText: 'Confirm and return to summary page',
      })
      return
    }

    res.render('pages/productSelection', {
      backlogProducts,
      categorisedProducts,
      selectedList: selectedList.map(x => x.name),
      suspendedProductsList: productList.filter((p: Product) => p.suspended),
      buttonText: 'Confirm',
    })
  }

  static selectProducts(req: Request, res: Response) {
    const { productList } = req.session
    const selectedList: string[] = []
    if (dataAccess().telemetryClient) {
      dataAccess().telemetryClient.trackEvent('selectProducts', {
        products: (req.session.selectedList || []).join(','),
      })
    }
    if (productList) {
      if (Array.isArray(req.body.selectedProducts)) selectedList.push(...req.body.selectedProducts)
      else if (req.body.selectedProducts) selectedList.push(req.body.selectedProducts)

      const selectedProductsError = ProductSelectionValidation.validateSelection(selectedList, productList)
      const { backlogProducts, categorisedProducts } = ProductSelectionController.splitProducts(productList)
      if (selectedProductsError) {
        res.render('pages/productSelection', {
          selectedProductsError,
          backlogProducts,
          categorisedProducts,
          buttonText: 'Confirm',
        })
        return
      }
      req.session.selectedList = productList.filter(x => selectedList.includes(x.name.toString()))
      res.redirect('/summary')
    }
  }

  private static splitProducts(productList: Product[]) {
    const isBacklog = (product: Product) =>
      [product.name, product.label].some(value => value?.toLowerCase() === BACKLOG_PRODUCT_NAME)
    return {
      backlogProducts: productList.filter(isBacklog),
      categorisedProducts: ProductSelectionController.categoriseProducts(productList.filter(p => !isBacklog(p))),
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
