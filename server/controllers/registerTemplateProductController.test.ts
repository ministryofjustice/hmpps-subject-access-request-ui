import type { Request, Response } from 'express'
import RegisterTemplateProductController from './registerTemplateProductController'
import productConfigsService from '../services/productConfigurations'

const productList = [
  {
    id: '12345',
    name: 'service-one',
    url: 'http://service-one',
    label: 'Service One',
  },
  {
    id: '67890',
    name: 'service-two',
    url: 'http://service-two',
    label: 'Service Two',
  },
]

beforeEach(() => {
  jest.resetAllMocks()
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('getProducts', () => {
  const req: Request = {
    session: {},
  } as unknown as Request
  const res: Response = {
    render: jest.fn(),
    redirect: jest.fn(),
  } as unknown as Response

  test('renders select products page with retrieved products', async () => {
    productConfigsService.getTemplateRegistrationProductList = jest.fn().mockReturnValue(productList)

    await RegisterTemplateProductController.getProducts(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'pages/registerTemplate/selectProduct',
      expect.objectContaining({
        productList,
      }),
    )
    expect(req.session.productList).toEqual(productList)
  })

  test('renders select product page with error when no products found', async () => {
    productConfigsService.getTemplateRegistrationProductList = jest.fn().mockReturnValue([])

    await RegisterTemplateProductController.getProducts(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'pages/registerTemplate/selectProduct',
      expect.objectContaining({
        productList: [],
        selectedProductError: 'No products found. A template cannot be registered.',
      }),
    )
    expect(req.session.productList).toEqual(productList)
  })
})

describe('selectProduct', () => {
  const req: Request = {
    session: { productList },
    body: {},
  } as unknown as Request
  const res: Response = {
    render: jest.fn(),
    redirect: jest.fn(),
  } as unknown as Response

  test('redirects to upload page when valid product selected', () => {
    req.body.product = '67890'

    RegisterTemplateProductController.selectProduct(req, res)

    expect(res.redirect).toHaveBeenCalledWith('/register-template/upload')
  })

  test('renders select product page with error when invalid product selected', () => {
    req.body.product = '99999'

    RegisterTemplateProductController.selectProduct(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'pages/registerTemplate/selectProduct',
      expect.objectContaining({
        productList,
        selectedProductError: 'Invalid product selection',
      }),
    )
  })
})
