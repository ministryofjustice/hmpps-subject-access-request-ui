import Page from '../pages/page'
import AuthSignInPage from '../pages/authSignIn'
import ConfirmationPage from '../pages/confirmation'

context('Confirmation', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
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

  it('Displays link to view reports page', () => {
    cy.signIn()
    cy.visit('/confirmation')
    const confirmationPage = Page.verifyOnPage(ConfirmationPage)
    confirmationPage.viewReportsLink().should('exist')
    confirmationPage.viewReportsLink().should('have.attr', 'href', '/reports')
  })
})
