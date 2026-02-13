import type { Request, Response } from 'express'
import ProductSelectionController from './productSelectionController'
import productConfigsService from '../services/productConfigurations'

let productConfigurationList: Product[]
const requestUser = { token: 'token-abc123', username: '', authSource: '' }

beforeEach(() => {
  productConfigurationList = [
    {
      id: 'e46c70cd-a2c3-4692-8a95-95905f06d4bf',
      name: 'hmpps-prisoner-search',
      label: 'Prisoner Search',
      url: 'https://prisoner-search-dev.prison.service.justice.gov.uk',
      enabled: true,
      category: 'PRISON',
    },
    {
      id: '76fd9b66-2e57-41f0-8084-e0c6e2660e2c',
      name: 'hmpps-book-secure-move-api',
      label: 'Book Secure Move API',
      url: 'https://book-move-dev.prison.service.justice.gov.uk',
      enabled: true,
      category: 'PRISON',
    },
    {
      id: 'd48a72c7-a8fa-4803-a83d-8c1f2b934273',
      name: 'hmpps-approved-premises-api',
      label: 'Community accommodation services',
      url: 'https://approved-premises-api-dev.hmpps.service.justice.gov.uk',
      enabled: true,
      category: 'PROBATION',
    },
  ]
  productConfigsService.getProductList = jest.fn().mockReturnValue(productConfigurationList)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('getProducts', () => {
  // @ts-expect-error stubbing res.render
  const res: Response = {
    render: jest.fn(),
  }

  test('renders a response with default inputs', async () => {
    productConfigsService.getProductList = jest.fn().mockReturnValue(productConfigurationList)

    const req: Request = {
      user: requestUser,
      // @ts-expect-error stubbing session
      session: {
        productList: [],
      },
      body: { selectedproducts: [] },
    }
    await ProductSelectionController.getProducts(req, res)
    expect(res.render).toHaveBeenCalled()
    expect(res.render).toHaveBeenCalledWith(
      'pages/productSelection',
      expect.objectContaining({
        categorisedProducts: [
          { name: 'PRISON', items: [productConfigurationList[0], productConfigurationList[1]] },
          { name: 'PROBATION', items: [productConfigurationList[2]] },
        ],
      }),
    )
  })

  test('renders a response with persisted values from session', async () => {
    productConfigsService.getProductList = jest.fn().mockReturnValue(productConfigurationList)

    const req: Request = {
      user: requestUser,
      // @ts-expect-error stubbing session
      session: { productList: [], selectedList: [{ name: '1' }] },
      body: { selectedproducts: [] },
    }
    await ProductSelectionController.getProducts(req, res)
    expect(res.render).toHaveBeenCalled()
    expect(res.render).toHaveBeenCalledWith(
      'pages/productSelection',
      expect.objectContaining({
        categorisedProducts: [
          { name: 'PRISON', items: [productConfigurationList[0], productConfigurationList[1]] },
          { name: 'PROBATION', items: [productConfigurationList[2]] },
        ],
        selectedList: expect.arrayContaining(['1']),
      }),
    )
  })

  test('renders an error if no products found', async () => {
    productConfigsService.getProductList = jest.fn().mockReturnValue([])

    const req: Request = {
      user: requestUser,
      // @ts-expect-error stubbing session
      session: { productList: [], selectedList: [{ name: '1' }] },
      body: { selectedproducts: [] },
    }
    await ProductSelectionController.getProducts(req, res)
    expect(res.render).toHaveBeenCalled()
    expect(res.render).toHaveBeenCalledWith(
      'pages/productSelection',
      expect.objectContaining({
        categorisedProducts: [],
        selectedProductsError: `No products found. A report cannot be generated.`,
      }),
    )
  })
})

describe('selectProducts', () => {
  // @ts-expect-error stubbing res
  const res: Response = {
    redirect: jest.fn(),
  }
  test('persists values to the session and redirects', async () => {
    const baseReq: Request = {
      // @ts-expect-error stubbing session
      session: {
        productList: [
          { id: '1', name: 'service-1', label: 'Svc 1', url: 'svc-1.com', enabled: true, category: 'PRISON' },
          { id: '2', name: 'service-2', label: 'Svc 2', url: 'svc-2.com', enabled: true, category: 'PRISON' },
        ],
        selectedList: [],
      },
      body: {
        selectedProducts: ['service-1'],
      },
    }
    await ProductSelectionController.selectProducts(baseReq, res)
    expect(baseReq.session.selectedList[0].name).toBe('service-1')
    expect(baseReq.session.selectedList[0].label).toBe('Svc 1')
    expect(res.redirect).toHaveBeenCalled()
    expect(res.redirect).toHaveBeenCalledWith('/summary')
  })

  test('overwrites previous session data if present', () => {
    const req: Request = {
      // @ts-expect-error stubbing session
      session: {
        productList: [
          { id: '1', name: 'service-1', label: 'Svc 1', url: 'svc-1.com', enabled: true, category: 'PRISON' },
          { id: '2', name: 'service-2', label: 'Svc 2', url: 'svc-2.com', enabled: true, category: 'PRISON' },
        ],
        selectedList: [
          { id: '1', name: 'service-1', label: 'Svc 1', url: 'svc-1.com', enabled: true, category: 'PRISON' },
        ],
      },
      body: {
        selectedProducts: ['service-2'],
      },
    }
    ProductSelectionController.selectProducts(req, res)
    expect(req.session.selectedList[0].name).toBe('service-2')
    expect(req.session.selectedList[0].label).toBe('Svc 2')
    expect(res.redirect).toHaveBeenCalled()
    expect(res.redirect).toHaveBeenCalledWith('/summary')
  })
})
