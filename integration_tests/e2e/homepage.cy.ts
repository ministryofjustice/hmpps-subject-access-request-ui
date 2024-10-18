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

  it('Displays SAR action cards', () => {
    cy.signIn()
    cy.visit('/')
    const homepage = Page.verifyOnPage(Homepage)
    homepage.sarActionCards().should('exist')
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
})
