import type { Request } from 'express'
import nock from 'nock'
import config from '../config'
import serviceConfigsService from './serviceConfigurations'

let sarApiMock: nock.Scope
let serviceConfigurationList: Service[]
let serviceConfigurationListWithoutExclusions: Service[]
const requestUser = { token: 'token-abc123', username: '', authSource: '' }

beforeEach(() => {
  sarApiMock = nock(`${config.apis.subjectAccessRequest.url}`, {
    reqheaders: { Authorization: `Bearer ${requestUser.token}` },
  })
  serviceConfigurationListWithoutExclusions = [
    {
      id: 'e46c70cd-a2c3-4692-8a95-95905f06d4bf',
      name: 'hmpps-prisoner-search',
      label: 'Prisoner Search',
      url: 'https://prisoner-search-dev.prison.service.justice.gov.uk',
      enabled: true,
      order: 1,
    },
    {
      id: '76fd9b66-2e57-41f0-8084-e0c6e2660e2c',
      name: 'hmpps-book-secure-move-api',
      label: 'Book Secure Move API',
      url: 'https://book-move-dev.prison.service.justice.gov.uk',
      enabled: true,
      order: 2,
    },
  ]
  serviceConfigurationList = serviceConfigurationListWithoutExclusions.concat([
    {
      id: 'e46c70cd-a2c3-4692-8a95-95905f06d4bf',
      name: 'G1',
      label: 'Excluded Service One',
      url: 'https://excluded-one-dev.prison.service.justice.gov.uk',
      enabled: true,
      order: 3,
    },
    {
      id: '76fd9b66-2e57-41f0-8084-e0c6e2660e2c',
      name: 'G2',
      label: 'Excluded Service Two',
      url: 'https://excluded-two-dev.prison.service.justice.gov.uk',
      enabled: true,
      order: 4,
    },
    {
      id: '76fd9b66-2e57-41f0-8084-e0c6e2660e2c',
      name: 'G3',
      label: 'Excluded Service Three',
      url: 'https://excluded-three-dev.prison.service.justice.gov.uk',
      enabled: true,
      order: 5,
    },
  ])
})

afterEach(() => {
  jest.resetAllMocks()
  nock.cleanAll()
})

describe('getServiceList', () => {
  const req: Request = {
    user: requestUser,
    session: { serviceList: [], selectedList: [] },
    body: { selectedservices: [] },
  } as unknown as Request

  test.each([
    { status: 401, expected: 'Unauthorized' },
    { status: 403, expected: 'Forbidden' },
    { status: 500, expected: 'Internal Server Error' },
  ])('should return error: "$expected" on status: $status', async ({ status, expected }) => {
    sarApiMock.get('/api/services').reply(status, { message: expected })

    await expect(() => serviceConfigsService.getServiceList(req)).rejects.toThrow(expected)
  })

  test('API response with empty list is successful', async () => {
    sarApiMock.get('/api/services').reply(200, [])

    const result = await serviceConfigsService.getServiceList(req)
    expect(result).toStrictEqual([])
  })

  test('returns service list', async () => {
    sarApiMock.get('/api/services').reply(200, serviceConfigurationList)

    const result = await serviceConfigsService.getServiceList(req)
    expect(result).toStrictEqual(serviceConfigurationList)
  })
})

describe('getTemplateRegistrationServiceList', () => {
  const req: Request = {
    user: requestUser,
    session: { serviceList: [], selectedList: [] },
    body: { selectedservices: [] },
  } as unknown as Request

  test.each([
    { status: 401, expected: 'Unauthorized' },
    { status: 403, expected: 'Forbidden' },
    { status: 500, expected: 'Internal Server Error' },
  ])('should return error: "$expected" on status: $status', async ({ status, expected }) => {
    sarApiMock.get('/api/services').reply(status, { message: expected })

    await expect(() => serviceConfigsService.getTemplateRegistrationServiceList(req)).rejects.toThrow(expected)
  })

  test('API response with empty list is successful', async () => {
    sarApiMock.get('/api/services').reply(200, [])

    const result = await serviceConfigsService.getTemplateRegistrationServiceList(req)
    expect(result).toStrictEqual([])
  })

  test('returns service list', async () => {
    sarApiMock.get('/api/services').reply(200, serviceConfigurationListWithoutExclusions)

    const result = await serviceConfigsService.getTemplateRegistrationServiceList(req)
    expect(result).toStrictEqual(serviceConfigurationListWithoutExclusions)
  })

  test('returns service list without excluded services', async () => {
    sarApiMock.get('/api/services').reply(200, serviceConfigurationList)

    const result = await serviceConfigsService.getTemplateRegistrationServiceList(req)
    expect(result).toStrictEqual(serviceConfigurationListWithoutExclusions)
  })
})
