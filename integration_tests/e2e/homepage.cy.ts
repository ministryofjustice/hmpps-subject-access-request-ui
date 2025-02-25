import Page from '../pages/page'
import AuthSignInPage from '../pages/authSignIn'
import Homepage from '../pages/homepage'

context('Homepage', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { roles: ['ROLE_SAR_USER_ACCESS'] })
  })

  it('Redirects to auth if requested by unauthenticated user', () => {
    cy.visit('/')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Renders for authenticated users', () => {
    cy.signIn()
    cy.visit('/')
  })

  it('Displays SAR action cards when not admin', () => {
    cy.signIn()
    cy.visit('/')
    const homepage = Page.verifyOnPage(Homepage)
    homepage.sarActionCards().should('exist')
    homepage.requestReportLink().should('exist')
    homepage.viewReportsLink().should('exist')
    homepage.adminLink().should('not.exist')
  })

  it('Displays SAR action cards when admin', () => {
    cy.task('stubSignIn', { roles: ['ROLE_SAR_ADMIN_ACCESS'] })
    cy.signIn()
    cy.visit('/')
    const homepage = Page.verifyOnPage(Homepage)
    homepage.sarActionCards().should('exist')
    homepage.requestReportLink().should('exist')
    homepage.viewReportsLink().should('exist')
    homepage.adminLink().should('exist')
  })

  it('Redirects to /subject-id on clicking Request a report link', () => {
    cy.signIn()
    cy.visit('/')
    const confirmationPage = Page.verifyOnPage(Homepage)
    confirmationPage.requestReportLink().click()
    cy.url().should('to.match', /subject-id$/)
  })

  it('Redirects to /reports on clicking View reports link', () => {
    cy.signIn()
    cy.visit('/')
    const confirmationPage = Page.verifyOnPage(Homepage)
    confirmationPage.viewReportsLink().click()
    cy.url().should('to.match', /reports$/)
  })

  it('Redirects to /admin on clicking Admin link', () => {
    cy.task('stubSignIn', { roles: ['ROLE_SAR_ADMIN_ACCESS'] })
    cy.signIn()
    cy.visit('/')
    const confirmationPage = Page.verifyOnPage(Homepage)
    confirmationPage.adminLink().click()
    cy.url().should('to.match', /admin$/)
  })
})
