import type { Request, Response } from 'express'
import productService from '../../services/productConfigurations'
import { audit, AuditEvent } from '../../audit'

export default class AdminProductConfigController {
  static async getProductConfigSummary(req: Request, res: Response) {
    const products = await productService.getProductList(req)
    req.session.productList = products

    res.render('pages/admin/productConfigSummary', {
      products,
    })
  }

  static async getProductConfigDetails(req: Request, res: Response) {
    const productId = req.query.id
    let { productList } = req.session
    if (!productList) {
      productList = await productService.getProductList(req)
      req.session.productList = productList
    }
    const productDetails = req.session.productList.find(product => product.id === productId)
    req.session.updatedProduct = productDetails
    const error = !productDetails ? `No product found with id ${productId}` : ''
    res.render('pages/admin/productConfigDetails', {
      productDetails,
      error,
    })
  }

  static async saveNewProductConfig(req: Request, res: Response) {
    const productDetails = AdminProductConfigController.productDetailsFromBody(req)
    req.session.newProduct = productDetails

    const sendAudit = audit(res.locals.user.username, { name: productDetails.name })
    await sendAudit(AuditEvent.CREATE_PRODUCT_CONFIG_ATTEMPT)

    const errors = AdminProductConfigController.validateInputs(productDetails)

    if (errors.hasError) {
      res.render('pages/admin/createProductConfig', {
        productDetails,
        errors,
      })
      return
    }
    res.redirect('/admin/confirm-create-product-config')
  }

  static async saveUpdatedProductConfig(req: Request, res: Response) {
    const productDetails = AdminProductConfigController.productDetailsFromBody(req)
    productDetails.id = req.session.updatedProduct.id
    req.session.updatedProduct = productDetails

    const sendAudit = audit(res.locals.user.username, { name: productDetails.name, id: productDetails.id })
    await sendAudit(AuditEvent.UPDATE_PRODUCT_CONFIG_ATTEMPT)

    const errors = AdminProductConfigController.validateInputs(productDetails)

    if (errors.hasError) {
      res.render('pages/admin/updateProductConfig', {
        productDetails,
        errors,
      })
      return
    }
    res.redirect('/admin/confirm-update-product-config')
  }

  static async confirmNewProductConfig(req: Request, res: Response) {
    const productDetails = req.session.newProduct
    try {
      await productService.createProduct(productDetails, req)
    } catch (error) {
      const sendAudit = audit(res.locals.user.username, { name: productDetails.name })
      await sendAudit(AuditEvent.CREATE_PRODUCT_CONFIG_FAILURE)

      const createError = (error.response && error.response.body && error.response.body.userMessage) || error.message
      res.render('pages/admin/confirmCreateProductConfig', {
        productDetails,
        createError,
      })
      return
    }
    req.session.newProduct = null
    res.redirect('/admin/product-config')
  }

  static async confirmUpdateProductConfig(req: Request, res: Response) {
    const productDetails = req.session.updatedProduct
    try {
      await productService.updateProduct(productDetails, req)
    } catch (error) {
      const sendAudit = audit(res.locals.user.username, { name: productDetails.name })
      await sendAudit(AuditEvent.UPDATE_PRODUCT_CONFIG_FAILURE)

      const updateError = (error.response && error.response.body && error.response.body.userMessage) || error.message
      res.render('pages/admin/confirmUpdateProductConfig', {
        productDetails,
        updateError,
      })
      return
    }
    req.session.productList = null
    res.redirect(`/admin/product-config-details?id=${productDetails.id}`)
    req.session.updatedProduct = null
  }

  static async cancelNewProductConfig(req: Request, res: Response) {
    req.session.newProduct = null
    res.redirect('/admin/product-config')
  }

  static async cancelUpdateProductConfig(req: Request, res: Response) {
    const { id } = req.session.updatedProduct
    req.session.updatedProduct = null
    res.redirect(`/admin/product-config-details?id=${id}`)
  }

  private static productDetailsFromBody(req: Request): Product {
    const body = req.body || {}
    return {
      id: null,
      name: body.name,
      label: body.label,
      url: body.url,
      category: body.category,
      enabled: body.enabled === 'enabled',
      templateMigrated: body.templateMigrated === 'templateMigrated',
    }
  }

  private static validateInputs(inputs: Product) {
    const nameError = this.validateField(inputs.name, 'name')
    const labelError = this.validateField(inputs.label, 'label')
    const urlError = this.validateField(inputs.url, 'url')
    const categoryError = this.validateField(inputs.category, 'category')
    const hasError = !!(nameError || labelError || urlError || categoryError)
    return { nameError, labelError, urlError, categoryError, hasError }
  }

  private static validateField(value: string, fieldName: string): string {
    if (!value) {
      return `${fieldName} must be provided`
    }
    return ''
  }
}
