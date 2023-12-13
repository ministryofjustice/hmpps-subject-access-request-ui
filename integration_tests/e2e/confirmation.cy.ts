import Page from '../pages/page'
import AuthSignInPage from '../pages/authSignIn'

context('Confirmation', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
  })

  // All pages direct users to auth
  it('Redirects to auth if requested by unauthenticated user', () => {
    cy.visit('/confirmation')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Renders for authenticated users', () => {
    cy.signIn()
    cy.visit('/confirmation')
  })
})
