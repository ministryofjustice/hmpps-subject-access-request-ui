import type { Request, Response } from 'express'
import RegisterTemplateServiceController from './registerTemplateServiceController'
import serviceConfigsService from '../services/serviceConfigurations'

const serviceList = [
  {
    id: '12345',
    name: 'service-one',
    url: 'http://service-one',
    label: 'Service One',
    order: 1,
  },
  {
    id: '67890',
    name: 'service-two',
    url: 'http://service-two',
    label: 'Service Two',
    order: 2,
  },
]

beforeEach(() => {
  jest.resetAllMocks()
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('getServices', () => {
  const req: Request = {
    session: {},
  } as unknown as Request
  const res: Response = {
    render: jest.fn(),
    redirect: jest.fn(),
  } as unknown as Response

  test('renders select services page with retrieved services', async () => {
    serviceConfigsService.getTemplateRegistrationServiceList = jest.fn().mockReturnValue(serviceList)

    await RegisterTemplateServiceController.getServices(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'pages/registerTemplate/selectService',
      expect.objectContaining({
        serviceList,
      }),
    )
    expect(req.session.serviceList).toEqual(serviceList)
  })

  test('renders select services page with error when no services found', async () => {
    serviceConfigsService.getTemplateRegistrationServiceList = jest.fn().mockReturnValue([])

    await RegisterTemplateServiceController.getServices(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'pages/registerTemplate/selectService',
      expect.objectContaining({
        serviceList: [],
        selectedServiceError: 'No services found. A template cannot be registered.',
      }),
    )
    expect(req.session.serviceList).toEqual(serviceList)
  })
})

describe('selectService', () => {
  const req: Request = {
    session: { serviceList },
    body: {},
  } as unknown as Request
  const res: Response = {
    render: jest.fn(),
    redirect: jest.fn(),
  } as unknown as Response

  test('redirects to upload page when valid service selected', () => {
    req.body.service = '67890'

    RegisterTemplateServiceController.selectService(req, res)

    expect(res.redirect).toHaveBeenCalledWith('/register-template/upload')
  })

  test('renders select services page with error when invalid service selected', () => {
    req.body.service = '99999'

    RegisterTemplateServiceController.selectService(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'pages/registerTemplate/selectService',
      expect.objectContaining({
        serviceList,
        selectedServiceError: 'Invalid service selection',
      }),
    )
  })
})
