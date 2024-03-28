import Page from '../pages/page'
import AuthSignInPage from '../pages/authSignIn'
import ReportsPage from '../pages/reports'

context('Reports', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
  })

  it('Redirects to auth if requested by unauthenticated user', () => {
    cy.visit('/reports')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Renders for authenticated users', () => {
    cy.signIn()
    cy.visit('/reports')
  })

  it('Displays table of reports', () => {
    cy.signIn()
    cy.visit('/reports')
    const reportsPage = Page.verifyOnPage(ReportsPage)
    reportsPage.reportsTable().should('exist')
    reportsPage.reportsTable().contains('Date of request')
    reportsPage.reportsTable().contains('Case Reference')
    reportsPage.reportsTable().contains('Subject ID')
    reportsPage.reportsTable().contains('Status')
  })

  it('Can be sorted on date of request', () => {
    cy.signIn()
    cy.visit('/reports')
    const reportsPage = Page.verifyOnPage(ReportsPage)
    reportsPage.reportsTableRow().first().contains('2024-12-01')
    reportsPage.sortByDateButton().click()
    reportsPage.reportsTableRow().first().contains('2022-12-30')
  })
})
