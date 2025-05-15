import Page from '../pages/page'
import AuthSignInPage from '../pages/authSignIn'
import AdminReportsPage from '../pages/adminReports'
import AuthErrorPage from '../pages/authError'
import AdminPage from '../pages/admin'
import AdminHealthPage from '../pages/adminHealth'

context('Admin', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { roles: ['ROLE_SAR_ADMIN_ACCESS'] })
    cy.task('stubGetSubjectAccessRequestAdminSummary', { requests: [], filterCount: 0 })
    cy.task('stubGetHealth', {
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
  })

  it('Redirects to auth if requested by unauthenticated user', () => {
    cy.visit('/admin')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Redirects to authError if requested by user without appropriate role', () => {
    cy.task('stubSignIn', { roles: ['ROLE_SAR_USER_ACCESS'] })
    cy.signIn()
    cy.visit('/admin', { failOnStatusCode: false })
    Page.verifyOnPage(AuthErrorPage)
  })

  it('Renders for authenticated users', () => {
    cy.signIn()
    cy.visit('/admin')
    Page.verifyOnPage(AdminPage)
  })

  it('Can navigate to health', () => {
    cy.signIn()
    cy.visit('/admin')
    const adminPage = Page.verifyOnPage(AdminPage)
    adminPage.healthLink().should('exist')
    adminPage.healthLink().contains('Health')
    adminPage.healthLink().click()
    Page.verifyOnPage(AdminHealthPage)
  })

  it('Can navigate to reports admin', () => {
    cy.signIn()
    cy.visit('/admin')
    const adminPage = Page.verifyOnPage(AdminPage)
    adminPage.reportsLink().should('exist')
    adminPage.reportsLink().contains('SAR reports')
    adminPage.reportsLink().click()
    Page.verifyOnPage(AdminReportsPage)
  })
})
