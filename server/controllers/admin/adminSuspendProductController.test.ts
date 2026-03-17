import type { Request, Response } from 'express'
import { auditService } from '@ministryofjustice/hmpps-audit-client'
import AdminSuspendProductController from './adminSuspendProductController'
import productService from '../../services/productConfigurations'
import ProductCategory from '../../@types/productCategory'
import { AuditEvent } from '../../audit'
import { auditAction } from '../../utils/testUtils'

const p1Active: Product = {
  id: 'aaaaaaaa-cb77-4c0e-a4de-1efc0e86ff34',
  name: 'product-1',
  url: 'http://www.product-1.com',
  label: 'Product 1',
  enabled: true,
  templateMigrated: true,
  category: ProductCategory.PRISON,
  suspended: false,
  suspendedAt: null,
}

const p1Suspended: Product = {
  id: 'aaaaaaaa-cb77-4c0e-a4de-1efc0e86ff34',
  name: 'product-1',
  url: 'http://www.product-1.com',
  label: 'Service 1',
  enabled: true,
  templateMigrated: true,
  category: ProductCategory.PRISON,
  suspended: true,
  suspendedAt: '16/03/2026 11:23:03',
}

beforeEach(() => {
  jest.resetAllMocks()
  jest.spyOn(auditService, 'sendAuditMessage').mockResolvedValue()

  productService.updateProductSuspendedStatus = jest.fn((_id, suspended: boolean, _req): Promise<Product> => {
    if (suspended) {
      return Promise.resolve(p1Suspended)
    }
    return Promise.resolve(p1Active)
  })
  productService.getProductList = jest.fn().mockResolvedValue([p1Active])
})

afterEach(() => {
  jest.resetAllMocks()
})

function newRequest(product: Product): Request {
  return {
    session: {
      updatedProduct: product,
    },
    query: {},
    user: {
      token: 'fakeUserToken',
      authSource: 'auth',
      username: 'username',
    },
  } as unknown as Request
}

function newResponse(): Response {
  return {
    redirect: jest.fn(),
    render: jest.fn(),
    set: jest.fn(),
    send: jest.fn(),
    locals: {
      user: {
        token: 'fakeUserToken',
        authSource: 'auth',
        username: 'username',
      },
    },
  } as unknown as Response
}

describe('suspend product', () => {
  let req: Request = newRequest(p1Active)
  const resp: Response = newResponse()

  test('return to product configuration details with error if updatedProduct is null', async () => {
    req = newRequest(null)

    await AdminSuspendProductController.confirmSuspendedStatusUpdate(req, resp)
    expect(resp.render).toHaveBeenCalledWith(
      'pages/admin/productConfigDetails',
      expect.objectContaining({
        error: 'Unexpected error: selected product was null',
      }),
    )
    expect(req.session.updatedProduct).toBeNull()
  })
  test('confirm product status change', async () => {
    req = newRequest(p1Active)

    await AdminSuspendProductController.confirmSuspendedStatusUpdate(req, resp)
    expect(resp.render).toHaveBeenCalledWith(
      'pages/admin/confirmProductSuspendedUpdate',
      expect.objectContaining({
        productDetails: p1Active,
      }),
    )
    expect(req.session.updatedProduct).toEqual(p1Active)
  })
})

describe('confirm suspended product', () => {
  let req: Request = newRequest(p1Active)
  const resp: Response = newResponse()

  test('confirm product status returns error when no suspended query param is provided', async () => {
    await AdminSuspendProductController.updatedSuspendedStatus(req, resp)
    expect(resp.render).toHaveBeenCalledWith(
      'pages/admin/productConfigDetails',
      expect.objectContaining({
        suspendErrors: ['No suspended query param provided'],
      }),
    )
  })

  test('confirm product status returns error when no req.session.updatedProduct is null', async () => {
    req = newRequest(null)
    req.body = { suspended: 'true' }

    await AdminSuspendProductController.updatedSuspendedStatus(req, resp)
    expect(resp.render).toHaveBeenCalledWith(
      'pages/admin/productConfigDetails',
      expect.objectContaining({
        suspendErrors: ['Unexpected error: selected product was null'],
      }),
    )
    expect(auditService.sendAuditMessage).not.toHaveBeenCalled()
  })

  test('confirm product status returns error when suspended is not a valid boolean', async () => {
    req = newRequest(p1Active)
    req.body = { suspended: 'yes' }

    await AdminSuspendProductController.updatedSuspendedStatus(req, resp)
    expect(resp.render).toHaveBeenCalledWith(
      'pages/admin/productConfigDetails',
      expect.objectContaining({
        suspendErrors: ['Invalid suspended query param provided'],
      }),
    )
    expect(auditService.sendAuditMessage).not.toHaveBeenCalled()
  })

  test('confirm product status returns error when no req.session.updatedProduct is null and suspended body value is null', async () => {
    req = newRequest(null)

    await AdminSuspendProductController.updatedSuspendedStatus(req, resp)
    expect(resp.render).toHaveBeenCalledWith(
      'pages/admin/productConfigDetails',
      expect.objectContaining({
        suspendErrors: ['No suspended query param provided', 'Unexpected error: selected product was null'],
      }),
    )
    expect(auditService.sendAuditMessage).not.toHaveBeenCalled()
  })

  test('confirm product status update returns error what update fails', async () => {
    req = newRequest(p1Active)
    req.body = { suspended: 'true' }

    productService.updateProductSuspendedStatus = jest.fn(
      (id: string, _suspended: boolean, _req: Request): Promise<Product> => {
        return Promise.reject(new Error(`failed to update product ${id} status`))
      },
    )

    await AdminSuspendProductController.updatedSuspendedStatus(req, resp)
    expect(resp.render).toHaveBeenCalledWith(
      'pages/admin/productConfigDetails',
      expect.objectContaining({
        suspendErrors: ['Unexpected error updating product status'],
      }),
    )
    expect(productService.updateProductSuspendedStatus).toHaveBeenCalledWith(p1Active.id, true, req)
    expect(productService.getProductList).not.toHaveBeenCalledWith(req)
    expect(auditService.sendAuditMessage).toHaveBeenCalledWith(
      auditAction(AuditEvent.UPDATE_PRODUCT_SUSPENDED_STATUS_ATTEMPT),
    )
    expect(auditService.sendAuditMessage).toHaveBeenCalledWith(
      auditAction(AuditEvent.UPDATE_PRODUCT_SUSPENDED_STATUS_FAILURE),
    )
  })

  test('confirm product status update is successfully suspended', async () => {
    req = newRequest(p1Active)
    req.body = { suspended: 'true' }

    productService.updateProductSuspendedStatus = jest.fn(
      (_id: string, _suspended: boolean, _req: Request): Promise<Product> => {
        return Promise.resolve(p1Suspended)
      },
    )

    await AdminSuspendProductController.updatedSuspendedStatus(req, resp)
    expect(resp.redirect).toHaveBeenCalledWith(`/admin/product-config-details?id=${p1Active.id}`)
    expect(productService.updateProductSuspendedStatus).toHaveBeenCalledWith(p1Active.id, true, req)
    expect(productService.getProductList).toHaveBeenCalledWith(req)
    expect(auditService.sendAuditMessage).toHaveBeenCalledWith(
      auditAction(AuditEvent.UPDATE_PRODUCT_SUSPENDED_STATUS_ATTEMPT),
    )
  })

  test('confirm product status update is successfully unsuspended', async () => {
    req = newRequest(p1Suspended)
    req.body = { suspended: 'false' }

    productService.updateProductSuspendedStatus = jest.fn(
      (_id: string, _suspended: boolean, _req: Request): Promise<Product> => {
        return Promise.resolve(p1Active)
      },
    )

    await AdminSuspendProductController.updatedSuspendedStatus(req, resp)
    expect(resp.redirect).toHaveBeenCalledWith(`/admin/product-config-details?id=${p1Active.id}`)
    expect(productService.updateProductSuspendedStatus).toHaveBeenCalledWith(p1Active.id, false, req)
    expect(productService.getProductList).toHaveBeenCalledWith(req)
    expect(auditService.sendAuditMessage).toHaveBeenCalledWith(
      auditAction(AuditEvent.UPDATE_PRODUCT_SUSPENDED_STATUS_ATTEMPT),
    )
  })
})
