import type { Request, Response } from 'express'
import ServiceSelectionController from './serviceSelectionController'
import serviceConfigsService from '../services/serviceConfigurations'

let serviceConfigurationList: Service[]
const requestUser = { token: 'token-abc123', username: '', authSource: '' }

beforeEach(() => {
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
  serviceConfigsService.getServiceList = jest.fn().mockReturnValue(serviceConfigurationList)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('getServices', () => {
  // @ts-expect-error stubbing res.render
  const res: Response = {
    render: jest.fn(),
  }

  test('renders a response with default inputs', async () => {
    serviceConfigsService.getServiceList = jest.fn().mockReturnValue(serviceConfigurationList)

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
    expect(res.render).toHaveBeenCalledWith(
      'pages/serviceSelection',
      expect.objectContaining({
        serviceList: expect.anything(),
      }),
    )
  })

  test('renders a response with persisted values from session', async () => {
    serviceConfigsService.getServiceList = jest.fn().mockReturnValue(serviceConfigurationList)

    const req: Request = {
      user: requestUser,
      // @ts-expect-error stubbing session
      session: { serviceList: [], selectedList: [{ name: '1' }] },
      body: { selectedservices: [] },
    }
    await ServiceSelectionController.getServices(req, res)
    expect(res.render).toHaveBeenCalled()
    expect(res.render).toHaveBeenCalledWith(
      'pages/serviceSelection',
      expect.objectContaining({
        serviceList: expect.anything(),
        selectedList: expect.arrayContaining(['1']),
      }),
    )
  })

  test('renders an error if no services found', async () => {
    serviceConfigsService.getServiceList = jest.fn().mockReturnValue([])

    const req: Request = {
      user: requestUser,
      // @ts-expect-error stubbing session
      session: { serviceList: [], selectedList: [{ name: '1' }] },
      body: { selectedservices: [] },
    }
    await ServiceSelectionController.getServices(req, res)
    expect(res.render).toHaveBeenCalled()
    expect(res.render).toHaveBeenCalledWith(
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
    expect(res.redirect).toHaveBeenCalledWith('/summary')
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
    expect(res.redirect).toHaveBeenCalledWith('/summary')
  })
})
