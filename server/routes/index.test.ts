import type { Express } from 'express'
import request from 'supertest'
import { auditService } from '@ministryofjustice/hmpps-audit-client'
import { appWithAllRoutes } from './testutils/appSetup'
import ServiceSelectionController from '../controllers/serviceSelectionController'
import ReportsController from '../controllers/reportsController'

let app: Express

beforeEach(() => {
  jest.resetAllMocks()
  jest.spyOn(auditService, 'sendAuditMessage').mockResolvedValue()

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
  ReportsController.getSubjectAccessRequestList = jest.fn().mockReturnValue({
    subjectAccessRequests: [
      {
        id: 'aaaaaaaa-cb77-4c0e-a4de-1efc0e86ff34',
        status: 'Pending',
        dateFrom: '2024-03-01',
        dateTo: '2024-03-12',
        sarCaseReferenceNumber: 'caseRef1',
        services:
          'hmpps-activities-management-api, https://activities-api-dev.prison.service.justice.gov.uk,keyworker-api, https://keyworker-api-dev.prison.service.justice.gov.uk,hmpps-manage-adjudications-api, https://manage-adjudications-api-dev.hmpps.service.justice.gov.uk',
        nomisId: '',
        ndeliusCaseReferenceId: 'A123456',
        requestedBy: 'user',
        requestDateTime: '2024-03-12T13:52:40.14177',
        claimDateTime: '2024-03-27T14:49:08.67033',
        claimAttempts: 1,
        objectUrl: null,
      },
      {
        id: 'bbbbbbbb-cb77-4c0e-a4de-1efc0e86ff34',
        status: 'Completed',
        dateFrom: '2023-03-01',
        dateTo: '2023-03-12',
        sarCaseReferenceNumber: 'caseRef2',
        services:
          'hmpps-activities-management-api, https://activities-api-dev.prison.service.justice.gov.uk,keyworker-api, https://keyworker-api-dev.prison.service.justice.gov.uk,hmpps-manage-adjudications-api, https://manage-adjudications-api-dev.hmpps.service.justice.gov.uk',
        nomisId: '',
        ndeliusCaseReferenceId: 'A123456',
        requestedBy: 'user',
        requestDateTime: '2023-03-12T13:52:40.14177',
        claimDateTime: '2023-03-27T14:49:08.67033',
        claimAttempts: 1,
        objectUrl: null,
      },
      {
        id: 'cccccccc-cb77-4c0e-a4de-1efc0e86ff34',
        status: 'Completed',
        dateFrom: '2022-03-01',
        dateTo: '2022-03-12',
        sarCaseReferenceNumber: 'caseRef3',
        services:
          'hmpps-activities-management-api, https://activities-api-dev.prison.service.justice.gov.uk,keyworker-api, https://keyworker-api-dev.prison.service.justice.gov.uk,hmpps-manage-adjudications-api, https://manage-adjudications-api-dev.hmpps.service.justice.gov.uk',
        nomisId: '',
        ndeliusCaseReferenceId: 'A123456',
        requestedBy: 'user',
        requestDateTime: '2022-03-12T13:52:40.14177',
        claimDateTime: '2022-03-27T14:49:08.67033',
        claimAttempts: 1,
        objectUrl: null,
      },
    ],
    numberOfReports: 3,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /', () => {
  it('should render homepage', () => {
    return request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Subject Access Request Service')
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

describe('GET /terms', () => {
  it('should render terms and conditions page', () => {
    return request(app)
      .get('/terms')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain(
          'Access to, and use of, this system is restricted to authorized Prison-NOMIS account users only.',
        )
      })
  })
})
