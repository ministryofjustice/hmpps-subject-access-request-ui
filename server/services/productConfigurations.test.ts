import type { Request } from 'express'
import nock from 'nock'
import config from '../config'
import productConfigsService from './productConfigurations'
import ProductCategory from '../@types/productCategory'

let sarApiMock: nock.Scope
let productConfigurationList: Product[]
let productConfigurationListWithoutExclusions: Product[]
const requestUser = { token: 'token-abc123', username: '', authSource: '' }

beforeEach(() => {
  sarApiMock = nock(`${config.apis.subjectAccessRequest.url}`, {
    reqheaders: { Authorization: `Bearer ${requestUser.token}` },
  })
  productConfigurationListWithoutExclusions = [
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
  ]
  productConfigurationList = productConfigurationListWithoutExclusions.concat([
    {
      id: 'e46c70cd-a2c3-4692-8a95-95905f06d4bf',
      name: 'G1',
      label: 'Excluded Service One',
      url: 'https://excluded-one-dev.prison.service.justice.gov.uk',
      enabled: true,
      category: 'PRISON',
    },
    {
      id: '76fd9b66-2e57-41f0-8084-e0c6e2660e2c',
      name: 'G2',
      label: 'Excluded Service Two',
      url: 'https://excluded-two-dev.prison.service.justice.gov.uk',
      enabled: true,
      category: 'PRISON',
    },
    {
      id: '76fd9b66-2e57-41f0-8084-e0c6e2660e2c',
      name: 'G3',
      label: 'Excluded Service Three',
      url: 'https://excluded-three-dev.prison.service.justice.gov.uk',
      enabled: true,
      category: 'PRISON',
    },
  ])
})

afterEach(() => {
  jest.resetAllMocks()
  nock.cleanAll()
})

describe('getProductList', () => {
  const req: Request = {
    user: requestUser,
    session: { productList: [], selectedList: [] },
    body: { selectedproducts: [] },
  } as unknown as Request

  test.each([
    { status: 401, expected: 'Unauthorized' },
    { status: 403, expected: 'Forbidden' },
    { status: 500, expected: 'Internal Server Error' },
  ])('should return error: "$expected" on status: $status', async ({ status, expected }) => {
    sarApiMock.get('/api/services').reply(status, { message: expected })

    await expect(() => productConfigsService.getProductList(req)).rejects.toThrow(expected)
  })

  test('API response with empty list is successful', async () => {
    sarApiMock.get('/api/services').reply(200, [])

    const result = await productConfigsService.getProductList(req)
    expect(result).toStrictEqual([])
  })

  test('returns product list', async () => {
    sarApiMock.get('/api/services').reply(200, productConfigurationList)

    const result = await productConfigsService.getProductList(req)
    expect(result).toStrictEqual(productConfigurationList)
  })
})

describe('getTemplateRegistrationProductList', () => {
  const req: Request = {
    user: requestUser,
    session: { productList: [], selectedList: [] },
    body: { selectedproducts: [] },
  } as unknown as Request

  test.each([
    { status: 401, expected: 'Unauthorized' },
    { status: 403, expected: 'Forbidden' },
    { status: 500, expected: 'Internal Server Error' },
  ])('should return error: "$expected" on status: $status', async ({ status, expected }) => {
    sarApiMock.get('/api/services').reply(status, { message: expected })

    await expect(() => productConfigsService.getTemplateRegistrationProductList(req)).rejects.toThrow(expected)
  })

  test('API response with empty list is successful', async () => {
    sarApiMock.get('/api/services').reply(200, [])

    const result = await productConfigsService.getTemplateRegistrationProductList(req)
    expect(result).toStrictEqual([])
  })

  test('returns product list', async () => {
    sarApiMock.get('/api/services').reply(200, productConfigurationListWithoutExclusions)

    const result = await productConfigsService.getTemplateRegistrationProductList(req)
    expect(result).toStrictEqual(productConfigurationListWithoutExclusions)
  })

  test('returns product list without excluded products', async () => {
    sarApiMock.get('/api/services').reply(200, productConfigurationList)

    const result = await productConfigsService.getTemplateRegistrationProductList(req)
    expect(result).toStrictEqual(productConfigurationListWithoutExclusions)
  })
})

describe('createProduct', () => {
  const req: Request = {
    user: requestUser,
  } as unknown as Request
  const newProduct: NewProduct = {
    name: 'my-prod-one',
    label: 'Product One',
    url: 'http://product-one',
    category: ProductCategory.PRISON,
    enabled: true,
    templateMigrated: true,
  }

  test.each([
    { status: 401, expected: 'Unauthorized' },
    { status: 403, expected: 'Forbidden' },
    { status: 500, expected: 'Internal Server Error' },
  ])('should return error: "$expected" on status: $status', async ({ status, expected }) => {
    sarApiMock.post('/api/services', { ...newProduct }).reply(status, { message: expected })

    await expect(() => productConfigsService.createProduct(newProduct, req)).rejects.toThrow(expected)

    expect(nock.isDone()).toBe(true)
  })

  test('API response is successful', async () => {
    sarApiMock.post('/api/services', { ...newProduct }).reply(201)

    await productConfigsService.createProduct(newProduct, req)

    expect(nock.isDone()).toBe(true)
  })
})
