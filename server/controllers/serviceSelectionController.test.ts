import type { Request, Response } from 'express'
import ServiceSelectionController from './serviceSelectionController'

beforeEach(() => {
  ServiceSelectionController.getServiceList = jest.fn().mockReturnValue([
    {
      id: 'hmpps-prisoner-search',
      name: 'Prisoner Search',
      url: 'https://prisoner-search-dev.prison.service.justice.gov.uk',
      disabled: false,
    },
    {
      id: 'hmpps-book-secure-move-api',
      name: 'Book Secure Move API',
      url: 'https://book-move-dev.prison.service.justice.gov.uk',
      disabled: false,
    },
  ])
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
    const req: Request = {
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
    const req: Request = {
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
    ServiceSelectionController.getServiceList = jest.fn().mockReturnValue([])
    const req: Request = {
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
          { name: 'service-1', label: 'Service 1', url: 'service-1.com', order: 1, disabled: false },
          { name: 'service-2', label: 'Service 2', url: 'service-2.com', order: 2, disabled: false },
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
          { name: 'service-1', label: 'Service 1', url: 'service-1.com', order: 1, disabled: false },
          { name: 'service-2', label: 'Service 2', url: 'service-2.com', order: 2, disabled: false },
        ],
        selectedList: [{ name: 'service-1', label: 'Service 1', url: 'service-1.com', order: 1, disabled: false }],
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
