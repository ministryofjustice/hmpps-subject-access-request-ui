import type { Request, Response } from 'express'
import productService from '../../services/productConfigurations'
import ProductCategory from '../../@types/productCategory'
import AdminProductConfigController from './adminProductConfigController'

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

beforeEach(() => {
  jest.resetAllMocks()
  productService.getProductList = jest.fn().mockReturnValue(productConfigs)
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
      'pages/admin/adminProductConfig',
      expect.objectContaining({
        products: productConfigs,
      }),
    )
    expect(req.session.productList).toEqual(productConfigs)
  })
})
