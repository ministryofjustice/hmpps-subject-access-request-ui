import Page from '../pages/page'
import AuthSignInPage from '../pages/authSignIn'
import SubjectIdPage from '../pages/subjectId'

context('SubjectId', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.intercept({
      method: 'POST',
      url: '/subject-id',
    }).as('saveSubjectId')
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

  it('Submits subject id user input and redirects to /inputs', () => {
    cy.signIn()
    cy.visit('/subject-id')
    const subjectIdPage = Page.verifyOnPage(SubjectIdPage)
    subjectIdPage.idTextBox().clear().type('A1111AA')
    subjectIdPage.continueButton().click()
    cy.wait('@saveSubjectId').then(interception => {
      cy.wrap(interception.request.body).should('include', 'subjectId=')
    })
    cy.url().should('to.match', /inputs$/)
  })

  it('Persists user inputs when returning to page', () => {
    cy.signIn()
    cy.visit('/subject-id')
    let inputsPage = Page.verifyOnPage(SubjectIdPage)
    inputsPage.idTextBox().clear().type('A1111AA')
    inputsPage.continueButton().click()
    cy.visit('/subject-id')
    inputsPage = Page.verifyOnPage(SubjectIdPage)
    inputsPage.idTextBox().should('have.value', 'A1111AA')
  })
})
