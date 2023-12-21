import Page from '../pages/page'
import AuthSignInPage from '../pages/authSignIn'
import IdentifySubjectPage from '../pages/identifySubject'

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

  it('Displays all necessary components', () => {
    cy.signIn()
    cy.visit('/identify-subject')
    const identifySubjectPage = Page.verifyOnPage(IdentifySubjectPage)
    identifySubjectPage.identifierHint().should('exist')
    identifySubjectPage.identifierTextBox().should('exist')
    identifySubjectPage.additionalInformation().should('exist')
    identifySubjectPage.continueButton().should('exist')
  })
})
