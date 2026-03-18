import { Request, Response } from 'express'
import productService from '../services/productConfigurations'
import ProductCategory from '../@types/productCategory'
import HomepageController from './homepageController'

const productOneActive: Product = {
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

const productOneSuspended: Product = {
  id: 'aaaaaaaa-cb77-4c0e-a4de-1efc0e86ff34',
  name: 'product-1',
  url: 'http://www.product-1.com',
  label: 'Product 1',
  enabled: true,
  templateMigrated: true,
  category: ProductCategory.PRISON,
  suspended: true,
  suspendedAt: '16/03/2026 11:23:03',
}

beforeEach(() => {
  jest.resetAllMocks()
})

function newRequest(): Request {
  return {
    session: {},
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
        userRoles: ['SAR_USER_ACCESS', 'SAR_ADMIN_ACCESS', 'SAR_REGISTER_TEMPLATE'],
      },
    },
  } as unknown as Response
}

describe('homepageController', () => {
  const req: Request = newRequest()
  const res: Response = newResponse()

  test.each([
    {
      actualUserRoles: [],
      expectSarUserRole: false,
      expectAdminRole: false,
      expectRegisterTemplateRole: false,
    },
    {
      actualUserRoles: ['SAR_USER_ACCESS'],
      expectSarUserRole: true,
      expectAdminRole: false,
      expectRegisterTemplateRole: false,
    },
    {
      actualUserRoles: ['SAR_ADMIN_ACCESS'],
      expectSarUserRole: false,
      expectAdminRole: true,
      expectRegisterTemplateRole: false,
    },
    {
      actualUserRoles: ['SAR_REGISTER_TEMPLATE'],
      expectSarUserRole: false,
      expectAdminRole: false,
      expectRegisterTemplateRole: true,
    },
    {
      actualUserRoles: ['SAR_USER_ACCESS', 'SAR_ADMIN_ACCESS', 'SAR_REGISTER_TEMPLATE'],
      expectSarUserRole: true,
      expectAdminRole: true,
      expectRegisterTemplateRole: true,
    },
  ])(
    'should returned expected value when for user role combination',
    async ({ actualUserRoles, expectSarUserRole, expectAdminRole, expectRegisterTemplateRole }) => {
      res.locals.user.userRoles = actualUserRoles
      productService.getProductList = jest.fn((_req: Request): Promise<Product[]> => {
        return Promise.resolve([])
      })

      await HomepageController.getHomepage(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/homepage', {
        error: undefined,
        suspendedProducts: [],
        hasSarUserRole: expectSarUserRole,
        hasAdminRole: expectAdminRole,
        hasRegisterTemplateRole: expectRegisterTemplateRole,
      })
    },
  )

  test('should return error when error getting product list', async () => {
    productService.getProductList = jest.fn((_req: Request): Promise<Product[]> => {
      return Promise.reject(Error('Cannot get product list from API'))
    })

    await HomepageController.getHomepage(req, res)
    expect(res.render).toHaveBeenCalledWith('pages/homepage', {
      error: 'Unexpected error getting products list from API',
      suspendedProducts: undefined,
      hasSarUserRole: true,
      hasAdminRole: true,
      hasRegisterTemplateRole: true,
    })
  })

  test('should return expected value when product is suspended', async () => {
    productService.getProductList = jest.fn((_req: Request): Promise<Product[]> => {
      return Promise.resolve([productOneSuspended])
    })

    await HomepageController.getHomepage(req, res)
    expect(res.render).toHaveBeenCalledWith('pages/homepage', {
      error: undefined,
      suspendedProducts: [productOneSuspended],
      hasSarUserRole: true,
      hasAdminRole: true,
      hasRegisterTemplateRole: true,
    })
  })

  test('should return suspendedProduct empty when no product is suspended', async () => {
    productService.getProductList = jest.fn((_req: Request): Promise<Product[]> => {
      return Promise.resolve([productOneActive])
    })

    await HomepageController.getHomepage(req, res)
    expect(res.render).toHaveBeenCalledWith('pages/homepage', {
      error: undefined,
      suspendedProducts: [],
      hasSarUserRole: true,
      hasAdminRole: true,
      hasRegisterTemplateRole: true,
    })
  })
})
