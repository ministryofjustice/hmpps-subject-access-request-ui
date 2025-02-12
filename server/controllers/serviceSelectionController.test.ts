import type { Request, Response } from 'express'
import nock from 'nock'
import ServiceSelectionController from './serviceSelectionController'
import config from '../config'

let sarApiMock: nock.Scope
let serviceConfigurationList: Service[]
const requestUser = { token: 'token-abc123', username: '', authSource: '' }

beforeEach(() => {
  sarApiMock = nock(`${config.apis.subjectAccessRequest.url}`, {
    reqheaders: { Authorization: `Bearer ${requestUser.token}` },
  })

  serviceConfigurationList = [
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
})

afterEach(() => {
  jest.resetAllMocks()
  nock.cleanAll()
})

describe('getServices', () => {
  // @ts-expect-error stubbing res.render
  const res: Response = {
    render: jest.fn(),
  }

  test('renders a response with default inputs', async () => {
    sarApiMock.get('/api/services').reply(200, serviceConfigurationList)

    const req: Request = {
      user: requestUser,
      // @ts-expect-error stubbing session
      session: {
        serviceList: [],
      },
      body: { selectedservices: [] },
    }
    await ServiceSelectionController.getServices(req, res)
    expect(res.render).toHaveBeenCalled()
    expect(res.render).toBeCalledWith(
      'pages/serviceSelection',
      expect.objectContaining({
        serviceList: expect.anything(),
      }),
    )
  })
  test('renders a response with persisted values from session', async () => {
    sarApiMock.get('/api/services').reply(200, serviceConfigurationList)

    const req: Request = {
      user: requestUser,
      // @ts-expect-error stubbing session
      session: { serviceList: [], selectedList: [{ name: '1' }] },
      body: { selectedservices: [] },
    }
    await ServiceSelectionController.getServices(req, res)
    expect(res.render).toHaveBeenCalled()
    expect(res.render).toBeCalledWith(
      'pages/serviceSelection',
      expect.objectContaining({
        serviceList: expect.anything(),
        selectedList: expect.arrayContaining(['1']),
      }),
    )
  })
  test('renders an error if no services found', async () => {
    sarApiMock.get('/api/services').reply(200, [])

    const req: Request = {
      user: requestUser,
      // @ts-expect-error stubbing session
      session: { serviceList: [], selectedList: [{ name: '1' }] },
      body: { selectedservices: [] },
    }
    await ServiceSelectionController.getServices(req, res)
    expect(res.render).toHaveBeenCalled()
    expect(res.render).toBeCalledWith(
      'pages/serviceSelection',
      expect.objectContaining({
        serviceList: expect.anything(),
        selectedServicesError: `No services found. A report cannot be generated.`,
      }),
    )
  })
})

describe('selectServices', () => {
  // @ts-expect-error stubbing res
  const res: Response = {
    redirect: jest.fn(),
  }
  test('persists values to the session and redirects', async () => {
    const baseReq: Request = {
      // @ts-expect-error stubbing session
      session: {
        serviceList: [
          { id: '1', name: 'service-1', label: 'Service 1', url: 'service-1.com', order: 1, enabled: true },
          { id: '2', name: 'service-2', label: 'Service 2', url: 'service-2.com', order: 2, enabled: true },
        ],
        selectedList: [],
      },
      body: {
        selectedServices: ['service-1'],
      },
    }
    await ServiceSelectionController.selectServices(baseReq, res)
    expect(baseReq.session.selectedList[0].name).toBe('service-1')
    expect(baseReq.session.selectedList[0].label).toBe('Service 1')
    expect(res.redirect).toHaveBeenCalled()
    expect(res.redirect).toBeCalledWith('/summary')
  })

  test('overwrites previous session data if present', () => {
    const req: Request = {
      // @ts-expect-error stubbing session
      session: {
        serviceList: [
          { id: '1', name: 'service-1', label: 'Service 1', url: 'service-1.com', order: 1, enabled: true },
          { id: '2', name: 'service-2', label: 'Service 2', url: 'service-2.com', order: 2, enabled: true },
        ],
        selectedList: [
          { id: '1', name: 'service-1', label: 'Service 1', url: 'service-1.com', order: 1, enabled: true },
        ],
      },
      body: {
        selectedServices: ['service-2'],
      },
    }
    ServiceSelectionController.selectServices(req, res)
    expect(req.session.selectedList[0].name).toBe('service-2')
    expect(req.session.selectedList[0].label).toBe('Service 2')
    expect(res.redirect).toHaveBeenCalled()
    expect(res.redirect).toBeCalledWith('/summary')
  })
})

describe('getServiceList', () => {
  const req: Request = {
    user: requestUser,
    // @ts-expect-error stubbing session
    session: { serviceList: [], selectedList: [] },
    body: { selectedservices: [] },
  }

  test.each([
    { status: 401, expected: 'Unauthorized' },
    { status: 403, expected: 'Forbidden' },
    { status: 500, expected: 'Internal Server Error' },
  ])('should return error: "$expected" on status: $status', async ({ status, expected }) => {
    sarApiMock.get('/api/services').reply(status, { message: expected })

    await expect(() => ServiceSelectionController.getServiceList(req)).rejects.toThrowError(expected)
  })

  test('API response with empty list is successful', async () => {
    sarApiMock.get('/api/services').reply(200, [])

    const result = await ServiceSelectionController.getServiceList(req)
    expect(result).toStrictEqual([])
  })

  test('returns service list', async () => {
    sarApiMock.get('/api/services').reply(200, serviceConfigurationList)

    const result = await ServiceSelectionController.getServiceList(req)
    expect(result).toStrictEqual(serviceConfigurationList)
  })
})
