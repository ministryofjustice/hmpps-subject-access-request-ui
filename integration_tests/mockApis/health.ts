import type { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'

export default {
  stubGetHealth: (
    httpStatus = 200,
    body = {
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
            portalUrl:
              'https://developer-portal.hmpps.service.justice.gov.uk/components/prison-register/environment/dev',
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
                healthUrl:
                  'https://hmpps-book-secure-move-api-staging.apps.cloud-platform.service.justice.gov.uk/health',
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
                templateHealthStatus: 'HEALTHY',
                error: 'some error',
              },
            },
            'hmpps-service-three-api': {
              status: 'DOWN',
              details: {
                healthUrl: 'https://hmpps-service-three-api-dev.hmpps.service.justice.gov.uk/health',
                portalUrl:
                  'https://developer-portal.hmpps.service.justice.gov.uk/components/hmpps-service-three-api/environment/dev',
                templateHealthStatus: 'UNHEALTHY',
                error: 'some error two',
              },
            },
            'hmpps-service-four-api': {
              status: 'DOWN',
              details: {
                healthUrl: 'https://hmpps-service-four-api-dev.hmpps.service.justice.gov.uk/health',
                portalUrl:
                  'https://developer-portal.hmpps.service.justice.gov.uk/components/hmpps-service-four-api/environment/dev',
                templateHealthStatus: 'NOT_MIGRATED',
                error: 'some error three',
              },
            },
          },
        },
      },
    },
  ): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/health',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: body,
      },
    }),
}
