import Page from '../pages/page'
import AuthSignInPage from '../pages/authSignIn'
import AuthErrorPage from '../pages/authError'
import AdminHealthPage from '../pages/adminHealth'

context('Admin Health', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { roles: ['ROLE_SAR_ADMIN_ACCESS'] })
    cy.task('stubGetHealth', {
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
                error: 'some error',
              },
            },
          },
        },
      },
    })
  })

  it('Redirects to auth if requested by unauthenticated user', () => {
    cy.visit('/admin/health')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Redirects to authError if requested by user without appropriate role', () => {
    cy.task('stubSignIn', { roles: ['ROLE_SAR_USER_ACCESS'] })
    cy.signIn()
    cy.visit('/admin/health', { failOnStatusCode: false })
    Page.verifyOnPage(AuthErrorPage)
  })

  it('Renders for authenticated users', () => {
    cy.signIn()
    cy.visit('/admin/health')
    Page.verifyOnPage(AdminHealthPage)
  })

  it('Displays document store health', () => {
    cy.signIn()
    cy.visit('/admin/health')
    const healthPage = Page.verifyOnPage(AdminHealthPage)
    healthPage.documentStoreHealthTable().should('exist').contains('Document store')
    healthPage.documentStoreRow(0).contains('Document store')
    healthPage.documentStoreRow(0).contains('UP').should('have.class', 'health-table__cell_UP')
  })

  it('Displays lookup services health', () => {
    cy.signIn()
    cy.visit('/admin/health')
    const healthPage = Page.verifyOnPage(AdminHealthPage)
    healthPage.lookupServicesHealthTable().should('exist').contains('Lookup services')
    healthPage.lookupServicesRow(0).contains('Prison')
    healthPage.lookupServicesRow(0).contains('UP').should('have.class', 'health-table__cell_UP')
    healthPage.lookupServicesRow(1).contains('External User')
    healthPage.lookupServicesRow(1).contains('UP').should('have.class', 'health-table__cell_UP')
    healthPage.lookupServicesRow(2).contains('Nomis User')
    healthPage.lookupServicesRow(2).contains('DOWN').should('have.class', 'health-table__cell_DOWN')
    healthPage.lookupServicesRow(3).contains('Probation User')
    healthPage.lookupServicesRow(3).contains('UP').should('have.class', 'health-table__cell_UP')
    healthPage.lookupServicesRow(4).contains('Locations')
    healthPage.lookupServicesRow(4).contains('UP').should('have.class', 'health-table__cell_UP')
    healthPage.lookupServicesRow(5).contains('Locations Nomis Mappings')
    healthPage.lookupServicesRow(5).contains('UP').should('have.class', 'health-table__cell_UP')
  })

  it('Displays SAR services health', () => {
    cy.signIn()
    cy.visit('/admin/health')
    const healthPage = Page.verifyOnPage(AdminHealthPage)
    healthPage.sarServicesHealthTable().should('exist').contains('SAR services')
    healthPage.sarServicesRow(0).contains('G1')
    healthPage.sarServicesRow(0).contains('DOWN').should('have.class', 'health-table__cell_DOWN')
    healthPage.sarServicesRow(1).contains('G2')
    healthPage.sarServicesRow(1).contains('UP').should('have.class', 'health-table__cell_UP')
    healthPage.sarServicesRow(2).contains('hmpps-book-secure-move-api')
    healthPage.sarServicesRow(2).contains('UP').should('have.class', 'health-table__cell_UP')
    healthPage.sarServicesRow(3).contains('hmpps-offender-categorisation-api')
    healthPage.sarServicesRow(3).contains('DOWN').should('have.class', 'health-table__cell_DOWN')
    healthPage.sarServicesRow(3).contains('some error')
  })
})
