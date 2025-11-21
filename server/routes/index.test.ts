import type { Express } from 'express'
import request from 'supertest'
import requestSession from 'supertest-session'
import { auditService } from '@ministryofjustice/hmpps-audit-client'
import { appWithAllRoutes, user } from './testutils/appSetup'
import reportService from '../services/report'
import adminHealthService from '../services/adminHealth'
import serviceConfigsService from '../services/serviceConfigurations'
import templateVersionService from '../services/templateVersions'
import { HmppsUser } from '../interfaces/hmppsUser'

let app: Express
let adminUserApp: Express
let regTemplateUserApp: Express

beforeEach(() => {
  jest.resetAllMocks()
  jest.spyOn(auditService, 'sendAuditMessage').mockResolvedValue()

  const sarUser: HmppsUser = {
    ...user,
    userRoles: ['SAR_USER_ACCESS'],
  }
  const adminUser: HmppsUser = {
    ...user,
    userRoles: ['SAR_ADMIN_ACCESS'],
  }
  const registerTemplateUser: HmppsUser = {
    ...user,
    userRoles: ['SAR_REGISTER_TEMPLATE'],
  }
  app = appWithAllRoutes({
    userSupplier: (): HmppsUser => sarUser,
  })
  adminUserApp = appWithAllRoutes({
    userSupplier: (): HmppsUser => adminUser,
  })
  regTemplateUserApp = appWithAllRoutes({
    userSupplier: (): HmppsUser => registerTemplateUser,
  })
  const serviceConfigs = [
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
  ]
  serviceConfigsService.getServiceList = jest.fn().mockReturnValue(serviceConfigs)
  serviceConfigsService.getTemplateRegistrationServiceList = jest.fn().mockReturnValue(serviceConfigs)
  const templateVersion = {
    createdDate: '2025-11-13T11:34:45Z',
    fileHash: 'abc',
    id: '123',
    serviceName: 'my-service',
    status: 'PENDING',
    version: 1,
  }
  templateVersionService.getTemplateVersions = jest.fn().mockReturnValue([templateVersion])
  templateVersionService.createTemplateVersion = jest.fn().mockReturnValue(templateVersion)
  const subjectAccessRequests = [
    {
      id: 'aaaaaaaa-cb77-4c0e-a4de-1efc0e86ff34',
      status: 'Pending',
      dateFrom: '2024-03-01',
      dateTo: '2024-03-12',
      sarCaseReferenceNumber: 'caseRef1',
      services:
        'hmpps-prisoner-search, https://prisoner-search-dev.prison.service.justice.gov.uk, hmpps-book-secure-move-api, https://book-move-dev.prison.service.justice.gov.uk',
      nomisId: '',
      ndeliusCaseReferenceId: 'A123456',
      requestedBy: 'user',
      requestDateTime: '2024-03-12T13:52:40.14177',
      claimDateTime: '2024-03-27T14:49:08.67033',
      claimAttempts: 1,
      objectUrl: '',
    },
    {
      id: 'bbbbbbbb-cb77-4c0e-a4de-1efc0e86ff34',
      status: 'Completed',
      dateFrom: '2023-03-01',
      dateTo: '2023-03-12',
      sarCaseReferenceNumber: 'caseRef2',
      services:
        'hmpps-prisoner-search, https://prisoner-search-dev.prison.service.justice.gov.uk, hmpps-book-secure-move-api, https://book-move-dev.prison.service.justice.gov.uk',
      nomisId: '',
      ndeliusCaseReferenceId: 'A123456',
      requestedBy: 'user',
      requestDateTime: '2023-03-12T13:52:40.14177',
      claimDateTime: '2023-03-27T14:49:08.67033',
      claimAttempts: 1,
      objectUrl: '',
    },
    {
      id: 'cccccccc-cb77-4c0e-a4de-1efc0e86ff34',
      status: 'Completed',
      dateFrom: '2022-03-01',
      dateTo: '2022-03-12',
      sarCaseReferenceNumber: 'caseRef3',
      services:
        'hmpps-prisoner-search, https://prisoner-search-dev.prison.service.justice.gov.uk, hmpps-book-secure-move-api, https://book-move-dev.prison.service.justice.gov.uk',
      nomisId: '',
      ndeliusCaseReferenceId: 'A123456',
      requestedBy: 'user',
      requestDateTime: '2022-03-12T13:52:40.14177',
      claimDateTime: '2022-03-27T14:49:08.67033',
      claimAttempts: 1,
      objectUrl: '',
    },
  ]
  reportService.getSubjectAccessRequestList = jest.fn().mockReturnValue({
    subjectAccessRequests,
    numberOfReports: 3,
  })
  reportService.getAdminSubjectAccessRequestDetails = jest.fn().mockReturnValue({
    subjectAccessRequests,
    numberOfReports: 3,
  })
  adminHealthService.getHealth = jest.fn().mockReturnValue({
    components: {
      'hmpps-document-management-api': { status: 'UP' },
      'hmpps-external-users-api': { status: 'UP' },
      'hmpps-locations-inside-prison-api': { status: 'UP' },
      'hmpps-nomis-mapping-service': { status: 'UP' },
      'nomis-user-roles-api': { status: 'DOWN' },
      'prison-register': { status: 'UP' },
      'subject-access-requests-and-delius': { status: 'UP' },
      sarServiceApis: { details: { G1: { status: 'DOWN' }, 'hmpps-book-secure-move-api': { status: 'UP' } } },
    },
  })
  reportService.restartSubjectAccessRequest = jest.fn().mockReturnValue({
    success: true,
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
        expect(res.text).toContain('Request a report')
        expect(res.text).toContain('View reports')
        expect(res.text).not.toContain('Admin')
        expect(res.text).not.toContain('Register a template')
      })
  })

  it('should render homepage when admin role', () => {
    return request(adminUserApp)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Subject Access Request Service')
        expect(res.text).not.toContain('Request a report')
        expect(res.text).not.toContain('View reports')
        expect(res.text).toContain('Admin')
        expect(res.text).not.toContain('Register a template')
      })
  })

  it('should render homepage when register template role', () => {
    return request(regTemplateUserApp)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Subject Access Request Service')
        expect(res.text).not.toContain('Request a report')
        expect(res.text).not.toContain('View reports')
        expect(res.text).not.toContain('Admin')
        expect(res.text).toContain('Register a template')
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

describe('GET /register-template/select-service', () => {
  it('should render register template service page', () => {
    return request(regTemplateUserApp)
      .get('/register-template/select-service')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Select Service')
      })
  })
})

describe('GET /register-template/upload', () => {
  it('should render register template upload page', () => {
    return request(regTemplateUserApp)
      .get('/register-template/upload')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Upload Template for')
      })
  })
})

describe('GET /register-template/confirmation', () => {
  it('should render register template confirmation page', () => {
    return request(regTemplateUserApp)
      .get('/register-template/confirmation')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Are you sure you want to register?')
      })
  })
})

describe('GET /register-template/result', () => {
  it('should render register template result page', () => {
    return request(regTemplateUserApp)
      .get('/register-template/result')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('New template version for  successfully registered')
      })
  })
})

describe('GET /admin', () => {
  it('should render admin page', () => {
    return request(adminUserApp)
      .get('/admin')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Subject Access Request Admin')
      })
  })
})

describe('GET /admin/reports', () => {
  it('should render admin details page', () => {
    return request(adminUserApp)
      .get('/admin/reports')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Reports Admin')
      })
  })
})

describe('GET /admin/details', () => {
  it('should render admin details page', async () => {
    const sessionBasedRequest = requestSession(adminUserApp)
    await sessionBasedRequest.get('/admin/reports')
    return sessionBasedRequest
      .get('/admin/details?id=aaaaaaaa-cb77-4c0e-a4de-1efc0e86ff34')
      .expect('Content-Type', /html/)
      .expect((res: { text: string }) => {
        expect(res.text).toContain('Subject Access Request Details')
      })
  })
})

describe('GET /admin/health', () => {
  it('should render admin health page', () => {
    return request(adminUserApp)
      .get('/admin/health')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Health')
      })
  })
})

describe('GET /admin/restart', () => {
  it('should redirect to admin details and preserve query param', () => {
    return request(adminUserApp)
      .get('/admin/restart?id=aaaaaaaa-cb77-4c0e-a4de-1efc0e86ff34')
      .expect(res => {
        expect(res.text).toContain('Redirecting to /admin/details?id=aaaaaaaa-cb77-4c0e-a4de-1efc0e86ff34')
      })
  })
})

describe('POST /admin/restart', () => {
  it('should redirect to admin details', () => {
    return request(app)
      .post('/admin/restart?id=aaaaaaaa-cb77-4c0e-a4de-1efc0e86ff34')
      .expect(res => {
        expect(res.statusCode).toBe(200)
        expect(res.text).toContain('Subject Access Request Details')
        expect(res.text).toContain('Request restarted successfully')
      })
  })
})
