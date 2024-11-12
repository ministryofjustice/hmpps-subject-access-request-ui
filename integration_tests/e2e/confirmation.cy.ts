import Page from '../pages/page'
import AuthSignInPage from '../pages/authSignIn'
import ConfirmationPage from '../pages/confirmation'

context('Confirmation', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { roles: ['ROLE_SAR_USER_ACCESS'] })
  })

  it('Redirects to auth if requested by unauthenticated user', () => {
    cy.visit('/confirmation')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Renders for authenticated users', () => {
    cy.signIn()
    cy.visit('/confirmation')
  })

  it('Displays confirmation panel', () => {
    cy.signIn()
    cy.visit('/confirmation')
    const confirmationPage = Page.verifyOnPage(ConfirmationPage)
    confirmationPage.confirmationPanel().should('exist')
  })

  it('Displays next steps', () => {
    cy.signIn()
    cy.visit('/confirmation')
    const confirmationPage = Page.verifyOnPage(ConfirmationPage)
    confirmationPage.nextSteps().should('exist')
  })

  it('Redirects to /reports on clicking view reports link', () => {
    cy.signIn()
    cy.visit('/confirmation')
    const confirmationPage = Page.verifyOnPage(ConfirmationPage)
    confirmationPage.viewReportsLink().click()
    cy.url().should('to.match', /reports$/)
  })
})
