import Page from '../pages/page'
import AuthSignInPage from '../pages/authSignIn'
import IndexPage from '../pages/homepage'
import TermsPage from '../pages/terms'

context('Terms', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
  })

  it('Redirects to auth if requested by unauthenticated user', () => {
    cy.visit('/terms')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Renders for authenticated users', () => {
    cy.signIn()
    cy.visit('/terms')
  })

  it('Displays all necessary components', () => {
    cy.signIn()
    cy.visit('/terms')
    const termsAndConditionsPage = Page.verifyOnPage(TermsPage)
    termsAndConditionsPage.termsAndConditions().should('exist')
    termsAndConditionsPage.linkToHomepage().should('exist')
  })

  it('redirects to homepage when back link is clicked', () => {
    cy.signIn()
    cy.visit('/terms')
    const termsAndConditionsPage = Page.verifyOnPage(TermsPage)
    termsAndConditionsPage.linkToHomepage().click()
    Page.verifyOnPage(IndexPage)
  })
})
