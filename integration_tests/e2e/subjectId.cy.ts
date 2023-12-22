import Page from '../pages/page'
import AuthSignInPage from '../pages/authSignIn'
import SubjectIdPage from '../pages/subjectId'

context('SubjectId', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
  })

  it('Redirects to auth if requested by unauthenticated user', () => {
    cy.visit('/subject-id')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Renders for authenticated users', () => {
    cy.signIn()
    cy.visit('/subject-id')
  })

  it('Displays all necessary components', () => {
    cy.signIn()
    cy.visit('/subject-id')
    const subjectIdPage = Page.verifyOnPage(SubjectIdPage)
    subjectIdPage.idHint().should('exist')
    subjectIdPage.idTextBox().should('exist')
    subjectIdPage.additionalInformation().should('exist')
    subjectIdPage.continueButton().should('exist')
  })
})
