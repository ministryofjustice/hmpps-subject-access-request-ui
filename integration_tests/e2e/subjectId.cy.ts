import Page from '../pages/page'
import AuthSignInPage from '../pages/authSignIn'
import SubjectIdPage from '../pages/subjectId'
import InputsPage from '../pages/inputs'
import IndexPage from '../pages'

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

  it('Submits valid subject id user input and redirects to /inputs', () => {
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
    let subjectIdPage = Page.verifyOnPage(SubjectIdPage)
    subjectIdPage.idTextBox().clear().type('A1111AA')
    subjectIdPage.continueButton().click()
    Page.verifyOnPage(InputsPage)
    cy.visit('/subject-id')
    subjectIdPage = Page.verifyOnPage(SubjectIdPage)
    subjectIdPage.idTextBox().should('have.value', 'A1111AA')
  })

  it('Does not allow subject ID to be empty', () => {
    cy.signIn()
    cy.visit('/subject-id')
    let subjectIdPage = Page.verifyOnPage(SubjectIdPage)
    subjectIdPage.continueButton().click()
    cy.wait('@saveSubjectId')
    cy.url().should('to.match', /subject-id$/)
    subjectIdPage = Page.verifyOnPage(SubjectIdPage)
    subjectIdPage.errorSummaryBox().should('exist')
  })

  it('Does not allow invalid input', () => {
    const invalidSubjectId = 'not-a-nomis-or-ndelius-id'
    cy.signIn()
    cy.visit('/subject-id')
    let subjectIdPage = Page.verifyOnPage(SubjectIdPage)
    subjectIdPage.idTextBox().clear().type(invalidSubjectId)
    subjectIdPage.continueButton().click()
    cy.wait('@saveSubjectId')
    cy.url().should('to.match', /subject-id$/)
    subjectIdPage = Page.verifyOnPage(SubjectIdPage)
    subjectIdPage.errorSummaryBox().should('exist')
  })

  it('redirects to homepage when back link is clicked', () => {
    cy.signIn()
    cy.visit('/subject-id')
    const subjectIdPage = Page.verifyOnPage(SubjectIdPage)
    subjectIdPage.backLink().click()
    Page.verifyOnPage(IndexPage)
  })
})
