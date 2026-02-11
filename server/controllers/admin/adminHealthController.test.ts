import type { Request, Response } from 'express'
import { auditService } from '@ministryofjustice/hmpps-audit-client'
import { auditAction } from '../../utils/testUtils'
import { AuditEvent } from '../../audit'
import adminHealthService from '../../services/adminHealth'
import { HealthResponse } from '../../@types/health'
import AdminHealthController from './adminHealthController'

const healthResponse: HealthResponse = {
  components: {
    'hmpps-document-management-api': {
      status: 'UP',
      details: {
        healthUrl: 'https://document-api-dev.hmpps.service.justice.gov.uk/health',
        portalUrl:
          'https://developer-portal.hmpps.service.justice.gov.uk/components/hmpps-document-management-api/environment/dev',
      },
    },
    'hmpps-external-users-api': {
      status: 'UP',
      details: {
        healthUrl: 'https://external-users-api-dev.hmpps.service.justice.gov.uk/health',
        portalUrl:
          'https://developer-portal.hmpps.service.justice.gov.uk/components/hmpps-external-users-api/environment/dev',
      },
    },
    'hmpps-locations-inside-prison-api': {
      status: 'UP',
      details: {
        healthUrl: 'https://locations-inside-prison-api-dev.hmpps.service.justice.gov.uk/health',
        portalUrl:
          'https://developer-portal.hmpps.service.justice.gov.uk/components/hmpps-locations-inside-prison-api/environment/dev',
      },
    },
    'hmpps-nomis-mapping-service': {
      status: 'UP',
      details: {
        healthUrl: 'https://nomis-sync-prisoner-mapping-dev.hmpps.service.justice.gov.uk/health',
        portalUrl:
          'https://developer-portal.hmpps.service.justice.gov.uk/components/hmpps-nomis-mapping-service/environment/dev',
      },
    },
    'nomis-user-roles-api': {
      status: 'DOWN',
      details: {
        healthUrl: 'https://nomis-user-roles-api-dev.prison.service.justice.gov.uk/health',
        portalUrl:
          'https://developer-portal.hmpps.service.justice.gov.uk/components/nomis-user-roles-api/environment/dev',
      },
    },
    'prison-register': {
      status: 'UP',
      details: {
        healthUrl: 'https://prison-register.hmpps.service.justice.gov.uk/health',
        portalUrl: 'https://developer-portal.hmpps.service.justice.gov.uk/components/prison-register/environment/dev',
      },
    },
    sarServiceApis: {
      details: {
        G1: {
          status: 'DOWN',
        },
        G2: {
          status: 'UP',
        },
        'hmpps-book-secure-move-api': {
          status: 'UP',
          details: {
            healthUrl: 'https://hmpps-book-secure-move-api-staging.apps.cloud-platform.service.justice.gov.uk/health',
            portalUrl:
              'https://developer-portal.hmpps.service.justice.gov.uk/components/hmpps-book-secure-move-api/environment/dev',
          },
        },
        'hmpps-offender-categorisation-api': {
          status: 'DOWN',
          details: {
            healthUrl: 'https://hmpps-offender-categorisation-api-dev.hmpps.service.justice.gov.uk/health',
            portalUrl:
              'https://developer-portal.hmpps.service.justice.gov.uk/components/hmpps-offender-categorisation-api/environment/dev',
            templateHealthStatus: 'Healthy',
          },
        },
        'hmpps-service-three-api': {
          status: 'UP',
          details: {
            healthUrl: 'https://hmpps-service-three-api-dev.hmpps.service.justice.gov.uk/health',
            portalUrl:
              'https://developer-portal.hmpps.service.justice.gov.uk/components/hmpps-service-three-api/environment/dev',
            templateHealthStatus: 'UNHEALTHY',
          },
        },
        'hmpps-service-four-api': {
          status: 'UP',
          details: {
            healthUrl: 'https://hmpps-service-four-api-dev.hmpps.service.justice.gov.uk/health',
            portalUrl:
              'https://developer-portal.hmpps.service.justice.gov.uk/components/hmpps-service-four-api/environment/dev',
            templateHealthStatus: 'NOT_MIGRATED',
          },
        },
      },
    },
    'subject-access-requests-and-delius': {
      status: 'UP',
      details: {
        healthUrl: 'https://subject-access-requests-and-delius-dev.hmpps.service.justice.gov.uk/health',
        portalUrl:
          'https://developer-portal.hmpps.service.justice.gov.uk/components/subject-access-requests-and-delius/environment/dev',
      },
    },
  },
}

beforeEach(() => {
  jest.resetAllMocks()
  jest.spyOn(auditService, 'sendAuditMessage').mockResolvedValue()
  adminHealthService.getHealth = jest.fn().mockReturnValue(healthResponse)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('getHealth', () => {
  const req: Request = {} as unknown as Request
  const res: Response = { render: jest.fn(), locals: { user: {} } } as unknown as Response
  test('renders a response with health details', async () => {
    await AdminHealthController.getHealth(req, res)
    expect(res.render).toHaveBeenCalledWith(
      'pages/admin/adminHealth',
      expect.objectContaining({
        documentStoreHealthRows: [
          [
            { text: 'Document store' },
            { html: '<a href="https://document-api-dev.hmpps.service.justice.gov.uk/health">Health</a>' },
            { text: 'UP', classes: `health-table__cell_UP` },
            { text: undefined },
            {
              html: '<a href="https://developer-portal.hmpps.service.justice.gov.uk/components/hmpps-document-management-api/environment/dev">Dev Portal</a>',
            },
          ],
        ],
        lookupServiceHealthRows: [
          [
            { text: 'Prison' },
            { html: '<a href="https://prison-register.hmpps.service.justice.gov.uk/health">Health</a>' },
            { text: 'UP', classes: `health-table__cell_UP` },
            { text: undefined },
            {
              html: '<a href="https://developer-portal.hmpps.service.justice.gov.uk/components/prison-register/environment/dev">Dev Portal</a>',
            },
          ],
          [
            { text: 'External User' },
            { html: '<a href="https://external-users-api-dev.hmpps.service.justice.gov.uk/health">Health</a>' },
            { text: 'UP', classes: `health-table__cell_UP` },
            { text: undefined },
            {
              html: '<a href="https://developer-portal.hmpps.service.justice.gov.uk/components/hmpps-external-users-api/environment/dev">Dev Portal</a>',
            },
          ],
          [
            { text: 'Nomis User' },
            { html: '<a href="https://nomis-user-roles-api-dev.prison.service.justice.gov.uk/health">Health</a>' },
            { text: 'DOWN', classes: `health-table__cell_DOWN` },
            { text: undefined },
            {
              html: '<a href="https://developer-portal.hmpps.service.justice.gov.uk/components/nomis-user-roles-api/environment/dev">Dev Portal</a>',
            },
          ],
          [
            { text: 'Probation User' },
            {
              html: '<a href="https://subject-access-requests-and-delius-dev.hmpps.service.justice.gov.uk/health">Health</a>',
            },
            { text: 'UP', classes: `health-table__cell_UP` },
            { text: undefined },
            {
              html: '<a href="https://developer-portal.hmpps.service.justice.gov.uk/components/subject-access-requests-and-delius/environment/dev">Dev Portal</a>',
            },
          ],
          [
            { text: 'Locations' },
            {
              html: '<a href="https://locations-inside-prison-api-dev.hmpps.service.justice.gov.uk/health">Health</a>',
            },
            { text: 'UP', classes: `health-table__cell_UP` },
            { text: undefined },
            {
              html: '<a href="https://developer-portal.hmpps.service.justice.gov.uk/components/hmpps-locations-inside-prison-api/environment/dev">Dev Portal</a>',
            },
          ],
          [
            { text: 'Locations Nomis Mappings' },
            {
              html: '<a href="https://nomis-sync-prisoner-mapping-dev.hmpps.service.justice.gov.uk/health">Health</a>',
            },
            { text: 'UP', classes: `health-table__cell_UP` },
            { text: undefined },
            {
              html: '<a href="https://developer-portal.hmpps.service.justice.gov.uk/components/hmpps-nomis-mapping-service/environment/dev">Dev Portal</a>',
            },
          ],
        ],
        sarServiceHealthRows: [
          [
            { text: 'G1' },
            { html: undefined },
            { text: 'DOWN', classes: `health-table__cell_DOWN` },
            { text: undefined },
            { text: undefined, classes: '' },
            { html: undefined },
          ],
          [
            { text: 'G2' },
            { html: undefined },
            { text: 'UP', classes: `health-table__cell_UP` },
            { text: undefined },
            { text: undefined, classes: '' },
            { html: undefined },
          ],
          [
            { text: 'hmpps-book-secure-move-api' },
            {
              html: '<a href="https://hmpps-book-secure-move-api-staging.apps.cloud-platform.service.justice.gov.uk/health">Health</a>',
            },
            { text: 'UP', classes: `health-table__cell_UP` },
            { text: undefined },
            { text: undefined, classes: '' },
            {
              html: '<a href="https://developer-portal.hmpps.service.justice.gov.uk/components/hmpps-book-secure-move-api/environment/dev">Dev Portal</a>',
            },
          ],
          [
            { text: 'hmpps-offender-categorisation-api' },
            {
              html: '<a href="https://hmpps-offender-categorisation-api-dev.hmpps.service.justice.gov.uk/health">Health</a>',
            },
            { text: 'DOWN', classes: `health-table__cell_DOWN` },
            { text: undefined },
            { text: 'Healthy', classes: 'health-table__cell_UP' },
            {
              html: '<a href="https://developer-portal.hmpps.service.justice.gov.uk/components/hmpps-offender-categorisation-api/environment/dev">Dev Portal</a>',
            },
          ],
          [
            { text: 'hmpps-service-three-api' },
            {
              html: '<a href="https://hmpps-service-three-api-dev.hmpps.service.justice.gov.uk/health">Health</a>',
            },
            { text: 'UP', classes: `health-table__cell_UP` },
            { text: undefined },
            { text: 'UNHEALTHY', classes: 'health-table__cell_DOWN' },
            {
              html: '<a href="https://developer-portal.hmpps.service.justice.gov.uk/components/hmpps-service-three-api/environment/dev">Dev Portal</a>',
            },
          ],
          [
            { text: 'hmpps-service-four-api' },
            {
              html: '<a href="https://hmpps-service-four-api-dev.hmpps.service.justice.gov.uk/health">Health</a>',
            },
            { text: 'UP', classes: `health-table__cell_UP` },
            { text: undefined },
            { text: 'NOT_MIGRATED', classes: '' },
            {
              html: '<a href="https://developer-portal.hmpps.service.justice.gov.uk/components/hmpps-service-four-api/environment/dev">Dev Portal</a>',
            },
          ],
        ],
      }),
    )
    expect(auditService.sendAuditMessage).toHaveBeenCalledWith(auditAction(AuditEvent.VIEW_ADMIN_HEALTH_ATTEMPT))
  })
})
