import type { Request, Response } from 'express'
import logger from '../../../logger'
import productService from '../../services/productConfigurations'
import { audit, AuditEvent } from '../../audit'

export default class AdminSuspendProductController {
  static async confirmSuspendedStatusUpdate(req: Request, res: Response) {
    const targetProduct = req.session.updatedProduct

    if (targetProduct === null) {
      res.render('pages/admin/productConfigDetails', {
        targetProduct,
        error: 'Unexpected error: selected product was null',
      })
    }
    req.session.updatedProduct = targetProduct
    return res.render('pages/admin/confirmProductSuspendedUpdate', {
      productDetails: targetProduct,
    })
  }

  static async updatedSuspendedStatus(req: Request, res: Response) {
    const params = AdminSuspendProductController.validateUpdateStatusRequest(req)
    if (params.hasErrors()) {
      return res.render('pages/admin/productConfigDetails', { suspendErrors: params.errorList })
    }

    const sendAudit = audit(res.locals.user.username, {
      name: params.productDetails.name,
      id: params.productDetails.id,
      suspendedValue: params.suspended,
    })
    await sendAudit(AuditEvent.UPDATE_PRODUCT_SUSPENDED_STATUS_ATTEMPT)

    let updatedProduct: Product
    try {
      updatedProduct = await productService.updateProductSuspendedStatus(
        params.productDetails.id,
        params.suspended,
        req,
      )
    } catch (err) {
      logger.error(err.message)
      await sendAudit(AuditEvent.UPDATE_PRODUCT_SUSPENDED_STATUS_FAILURE)
      return res.render('pages/admin/productConfigDetails', {
        suspendErrors: ['Unexpected error updating product status'],
      })
    }

    req.session.updatedProduct = updatedProduct
    req.session.productList = await productService.getProductList(req)
    return res.redirect(`/admin/product-config-details?id=${updatedProduct.id}`)
  }

  private static validateUpdateStatusRequest(req: Request) {
    const suspended: string = req?.body?.suspended
    const productDetails = req?.session?.updatedProduct

    const errorList: string[] = []
    if (suspended == null) {
      errorList.push('No suspended query param provided')
    }
    if (suspended != null && !(suspended.toLowerCase() === 'true' || suspended.toLowerCase() === 'false')) {
      errorList.push('Invalid suspended query param provided')
    }
    if (productDetails == null) {
      errorList.push('Unexpected error: selected product was null')
    }

    return {
      suspended: suspended === 'true',
      productDetails,
      errorList,
      hasErrors(): boolean {
        return errorList.length > 0
      },
    }
  }
}
