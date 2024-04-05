import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes } from './testutils/appSetup'
import ServiceSelectionController from '../controllers/serviceSelectionController'

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({})
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

describe('GET /', () => {
  it('should render index page', () => {
    return request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('This site is under construction...')
      })
  })
})

describe('GET /subject-id', () => {
  it('should render subject id page', () => {
    return request(app)
      .get('/subject-id')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('ID for the subject')
      })
  })
})

describe('GET /inputs', () => {
  it('should render inputs page', () => {
    return request(app)
      .get('/inputs')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Enter details')
      })
  })
})

describe('POST /inputs', () => {
  it('should redirect to itself given no data', () => {
    return request(app)
      .post('/inputs')
      .expect(res => {
        expect(res.statusCode).toBe(200)
        expect(res.text).toContain('Enter details')
      })
  })
})

describe('GET /service-selection', () => {
  it('should render service-selection page', () => {
    return request(app)
      .get('/service-selection')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Select Services')
      })
  })
})

describe('POST /service-selection', () => {
  it.skip('should redirect to itself given no data', () => {
    return request(app)
      .post('/service-selection')
      .expect(res => {
        expect(res.statusCode).toBe(200)
        expect(res.text).toContain('Select services')
      })
  })
})

describe('GET /confirmation', () => {
  it('should render confirmation page', () => {
    return request(app)
      .get('/confirmation')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('has been submitted')
      })
  })
})

describe('GET /reports', () => {
  it('should render reports page', () => {
    return request(app)
      .get('/reports')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Subject Access Request Reports')
      })
  })
})
