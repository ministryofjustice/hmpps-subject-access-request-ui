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

  static async saveNewProductConfig(req: Request, res: Response) {
    const { name, label, url, category, enabled, templateMigrated } = req.body || {}

    const sendAudit = audit(res.locals.user.username, { name })
    await sendAudit(AuditEvent.CREATE_PRODUCT_CONFIG_ATTEMPT)

    req.session.newProduct = {
      name,
      label,
      url,
      category,
      enabled: enabled === 'enabled',
      templateMigrated: templateMigrated === 'templateMigrated',
    }

    const nameError = AdminProductConfigController.validateField(name, 'name')
    const labelError = AdminProductConfigController.validateField(label, 'label')
    const urlError = AdminProductConfigController.validateField(url, 'url')
    const categoryError = AdminProductConfigController.validateField(category, 'category')

    if (nameError || labelError || urlError || categoryError) {
      res.render('pages/admin/productConfigDetails', {
        productDetails: req.session.newProduct,
        nameError,
        labelError,
        urlError,
        categoryError,
      })
      return
    }

    res.redirect('/admin/confirm-product-config')
  }

  static async confirmNewProductConfig(req: Request, res: Response) {
    try {
      await productService.createProduct(req.session.newProduct, req)
    } catch (error) {
      const sendAudit = audit(res.locals.user.username, { name: req.session.newProduct.name })
      await sendAudit(AuditEvent.CREATE_PRODUCT_CONFIG_FAILURE)

      res.render('pages/admin/confirmProductConfig', {
        productDetails: req.session.newProduct,
        createError: error.message,
      })
      return
    }
    req.session.newProduct = null
    res.redirect('/admin/product-config')
  }

  static async cancelNewProductConfig(req: Request, res: Response) {
    req.session.newProduct = null
    res.redirect('/admin/product-config')
  }

  static validateField(value: string, fieldName: string): string {
    if (!value) {
      return `${fieldName} must be provided`
    }
    return ''
  }
}
