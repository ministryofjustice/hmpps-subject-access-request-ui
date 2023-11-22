import AuthSignInPage from '../pages/authSignIn'
import InputsPage from '../pages/inputs'
import Page from '../pages/page'

context('Inputs', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
  })

  it('Unauthenticated user navigating to inputs page directed to auth', () => {
    cy.visit('/inputs')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Returns a response', () => {
    cy.request('/inputs').its('body').should('exist')
  })

  it('Contains all necessary input components', () => {
    cy.signIn()
    cy.visit('/inputs')
    const inputsPage = Page.verifyOnPage(InputsPage)
    inputsPage.datePickerFrom().should('exist')
    inputsPage.datePickerTo().should('exist')
    inputsPage.caseReferenceTextbox().should('exist')
    inputsPage.continueButton().should('exist')
  })
})
