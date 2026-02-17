import type { Request, Response } from 'express'
import { auditService } from '@ministryofjustice/hmpps-audit-client'
import productService from '../../services/productConfigurations'
import ProductCategory from '../../@types/productCategory'
import AdminProductConfigController from './adminProductConfigController'
import { auditAction } from '../../utils/testUtils'
import { AuditEvent } from '../../audit'

const productConfigs: Product[] = [
  {
    id: 'aaaaaaaa-cb77-4c0e-a4de-1efc0e86ff34',
    name: 'hmpps-hdc-api',
    url: 'https://hdc-api-dev.hmpps.service.justice.gov.uk',
    label: 'Home detention curfew',
    enabled: true,
    templateMigrated: true,
    category: ProductCategory.PRISON,
  },
  {
    id: 'bbbbbbbb-cb77-4c0e-a4de-1efc0e86ff34',
    name: 'hmpps-incentives-api',
    url: 'https://incentives-api-dev.hmpps.service.justice.gov.uk',
    label: 'Incentives',
    enabled: true,
    templateMigrated: false,
    category: ProductCategory.PRISON,
  },
  {
    id: 'cccccccc-cb77-4c0e-a4de-1efc0e86ff34',
    name: 'make-recall-decision-api',
    url: 'https://make-recall-decision-api-dev.hmpps.service.justice.gov.uk',
    label: 'Consider a recall',
    enabled: false,
    templateMigrated: false,
    category: ProductCategory.PROBATION,
  },
]
const newProduct: NewProduct = {
  name: 'my-prod-one',
  label: 'Product One',
  url: 'http://product-one',
  category: 'PRISON',
  enabled: true,
  templateMigrated: true,
}

beforeEach(() => {
  jest.resetAllMocks()
  jest.spyOn(auditService, 'sendAuditMessage').mockResolvedValue()
  productService.getProductList = jest.fn().mockReturnValue(productConfigs)
  productService.createProduct = jest.fn()
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('getProductConfigSummary', () => {
  const req: Request = {
    session: {},
    query: {},
    user: {
      token: 'fakeUserToken',
      authSource: 'auth',
      username: 'username',
    },
  } as unknown as Request
  const res: Response = {
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
  test('renders a response with list of product configurations', async () => {
    await AdminProductConfigController.getProductConfigSummary(req, res)
    expect(res.render).toHaveBeenCalledWith(
      'pages/admin/productConfigSummary',
      expect.objectContaining({
        products: productConfigs,
      }),
    )
    expect(req.session.productList).toEqual(productConfigs)
  })
})

describe('saveNewProductConfig', () => {
  const req: Request = {
    session: {},
    query: {},
    body: {},
    user: {
      token: 'fakeUserToken',
      authSource: 'auth',
      username: 'username',
    },
  } as unknown as Request
  const res: Response = {
    render: jest.fn(),
    redirect: jest.fn(),
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
  const productBody = {
    name: newProduct.name,
    label: newProduct.label,
    url: newProduct.url,
    category: 'PRISON',
    enabled: 'enabled',
    templateMigrated: 'templateMigrated',
  }

  test.each([
    [productBody, newProduct],
    [
      { ...productBody, category: 'PROBATION', enabled: '' },
      { ...newProduct, category: 'PROBATION', enabled: false, templateMigrated: true },
    ],
    [
      { ...productBody, enabled: '', templateMigrated: '' },
      { ...newProduct, enabled: false, templateMigrated: false },
    ],
  ])('details successfully stored in session and redirects to confirm page', async (body, expectedNewProduct) => {
    req.body = body

    await AdminProductConfigController.saveNewProductConfig(req, res)

    expect(res.redirect).toHaveBeenCalledWith('/admin/confirm-product-config')
    expect(req.session.newProduct).toEqual(expectedNewProduct)
    expect(auditService.sendAuditMessage).toHaveBeenCalledWith(auditAction(AuditEvent.CREATE_PRODUCT_CONFIG_ATTEMPT))
  })

  test.each([
    [{ ...productBody, name: '' }, { ...newProduct, name: '' }, 'name must be provided', '', '', ''],
    [{ ...productBody, name: null }, { ...newProduct, name: null }, 'name must be provided', '', '', ''],
    [{ ...productBody, name: undefined }, { ...newProduct, name: undefined }, 'name must be provided', '', '', ''],
    [{ ...productBody, label: '' }, { ...newProduct, label: '' }, '', 'label must be provided', '', ''],
    [{ ...productBody, label: null }, { ...newProduct, label: null }, '', 'label must be provided', '', ''],
    [{ ...productBody, label: undefined }, { ...newProduct, label: undefined }, '', 'label must be provided', '', ''],
    [{ ...productBody, url: '' }, { ...newProduct, url: '' }, '', '', 'url must be provided', ''],
    [{ ...productBody, url: null }, { ...newProduct, url: null }, '', '', 'url must be provided', ''],
    [{ ...productBody, url: undefined }, { ...newProduct, url: undefined }, '', '', 'url must be provided', ''],
    [{ ...productBody, category: '' }, { ...newProduct, category: '' }, '', '', '', 'category must be provided'],
    [{ ...productBody, category: null }, { ...newProduct, category: null }, '', '', '', 'category must be provided'],
    [
      { ...productBody, category: undefined },
      { ...newProduct, category: undefined },
      '',
      '',
      '',
      'category must be provided',
    ],
    [
      { ...productBody, name: '', label: null, url: undefined, category: '' },
      { ...newProduct, name: '', label: null, url: undefined, category: '' },
      'name must be provided',
      'label must be provided',
      'url must be provided',
      'category must be provided',
    ],
  ])(
    'details submitted fail validation and renders error',
    async (body, expectedNewProduct, nameError, labelError, urlError, categoryError) => {
      req.body = body

      await AdminProductConfigController.saveNewProductConfig(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'pages/admin/productConfigDetails',
        expect.objectContaining({
          productDetails: expectedNewProduct,
          nameError,
          labelError,
          urlError,
          categoryError,
        }),
      )
      expect(req.session.newProduct).toEqual(expectedNewProduct)
      expect(auditService.sendAuditMessage).toHaveBeenCalledWith(auditAction(AuditEvent.CREATE_PRODUCT_CONFIG_ATTEMPT))
    },
  )
})

describe('confirmNewProductConfig', () => {
  const req: Request = {
    session: {},
  } as unknown as Request
  const res: Response = {
    render: jest.fn(),
    redirect: jest.fn(),
    locals: {
      user: {
        username: 'username',
      },
    },
  } as unknown as Response

  beforeEach(() => {
    req.session.newProduct = newProduct
  })

  test('api called successfully and redirects to product config summary page', async () => {
    await AdminProductConfigController.confirmNewProductConfig(req, res)

    expect(productService.createProduct).toHaveBeenCalledWith(newProduct, req)
    expect(res.redirect).toHaveBeenCalledWith('/admin/product-config')
    expect(req.session.newProduct).toBeNull()
  })

  test('api returns error and renders config details with error', async () => {
    const createProductMock = productService.createProduct as jest.Mock
    createProductMock.mockRejectedValueOnce(new Error('Internal error'))

    await AdminProductConfigController.confirmNewProductConfig(req, res)

    expect(productService.createProduct).toHaveBeenCalledWith(newProduct, req)
    expect(res.render).toHaveBeenCalledWith(
      'pages/admin/confirmProductConfig',
      expect.objectContaining({
        productDetails: newProduct,
        createError: 'Internal error',
      }),
    )
    expect(req.session.newProduct).toEqual(newProduct)
    expect(auditService.sendAuditMessage).toHaveBeenCalledWith(auditAction(AuditEvent.CREATE_PRODUCT_CONFIG_FAILURE))
  })
})

describe('cancelNewProductConfig', () => {
  const req: Request = {
    session: {},
    user: {
      token: 'fakeUserToken',
      authSource: 'auth',
      username: 'username',
    },
  } as unknown as Request
  const res: Response = {
    redirect: jest.fn(),
  } as unknown as Response

  beforeEach(() => {
    req.session.newProduct = newProduct
  })

  test('clears session and redirects to product config summary', async () => {
    await AdminProductConfigController.cancelNewProductConfig(req, res)

    expect(res.redirect).toHaveBeenCalledWith('/admin/product-config')
    expect(req.session.newProduct).toBeNull()
  })
})
