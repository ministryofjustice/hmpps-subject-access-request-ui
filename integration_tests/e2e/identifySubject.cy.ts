import Page from '../pages/page'
import AuthSignInPage from '../pages/authSignIn'

context('IdentifySubject', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
  })

  it('Redirects to auth if requested by unauthenticated user', () => {
    cy.visit('/identify-subject')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Renders for authenticated users', () => {
    cy.signIn()
    cy.visit('/identify-subject')
  })
})
