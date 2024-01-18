import type { Request, Response } from 'express'
import ServiceSelectionController from './serviceSelectionController'

beforeEach(() => {
  ServiceSelectionController.getServiceCatalogueList = jest.fn().mockReturnValue([
    {
      id: 351,
      name: 'hmpps-prisoner-search',
      environments: [{ id: 47254, url: 'https://prisoner-search-dev.prison.service.justice.gov.uk' }],
    },
    { id: 211, name: 'hmpps-book-secure-move-api', environments: [] },
    {
      id: 175,
      name: 'hmpps-prisoner-search-indexer',
      environments: [{ id: 47270, url: 'https://prisoner-search-indexer-dev.prison.service.justice.gov.uk' }],
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
      session: { serviceList: [] },
      body: { selectedservices: [] },
    }
    await ServiceSelectionController.getServices(req, res)
    expect(res.render).toHaveBeenCalled()
    expect(res.render).toBeCalledWith(
      'pages/serviceselection',
      expect.objectContaining({
        servicelist: expect.anything(),
      }),
    )
  })
  test('renders a response with persisted values from session', async () => {
    const req: Request = {
      // @ts-expect-error stubbing session
      session: { serviceList: [], selectedList: [{ id: '1' }] },
      body: { selectedservices: [] },
    }
    await ServiceSelectionController.getServices(req, res)
    expect(res.render).toHaveBeenCalled()
    expect(res.render).toBeCalledWith(
      'pages/serviceselection',
      expect.objectContaining({
        servicelist: expect.anything(),
        selectedList: expect.arrayContaining(['1']),
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
      session: { serviceList: [{ text: 'service', value: 'service.com', id: '1' }] },
      body: {
        selectedServices: ['1'],
      },
    }
    await ServiceSelectionController.selectServices(baseReq, res)
    expect(baseReq.session.selectedList[0].id).toBe('1')
    expect(baseReq.session.selectedList[0].text).toBe('service')
    expect(baseReq.session.selectedList[0].value).toBe('service.com')
    expect(res.redirect).toHaveBeenCalled()
    expect(res.redirect).toBeCalledWith('/summary')
  })

  test('overwrites previous session data if present', () => {
    const req: Request = {
      // @ts-expect-error stubbing session
      session: {
        serviceList: [
          { text: 'service', value: 'service.com', id: '1' },
          { text: 'service2', value: 'service2.com', id: '2' },
        ],
        selectedList: [{ text: 'service', value: 'service.com', id: '1' }],
      },
      body: {
        selectedServices: ['2'],
      },
    }
    ServiceSelectionController.selectServices(req, res)
    expect(req.session.selectedList[0].id).toBe('2')
    expect(req.session.selectedList[0].text).toBe('service2')
    expect(req.session.selectedList[0].value).toBe('service2.com')
    expect(res.redirect).toHaveBeenCalled()
    expect(res.redirect).toBeCalledWith('/summary')
  })
})
