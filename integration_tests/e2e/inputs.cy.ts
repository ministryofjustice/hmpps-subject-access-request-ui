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

  it('Contains all necessary input components with default values', () => {
    cy.signIn()
    cy.visit('/inputs')
    const inputsPage = Page.verifyOnPage(InputsPage)
    inputsPage.datePickerFrom().should('exist')
    inputsPage.datePickerFrom().should('have.value', '')
    inputsPage.datePickerTo().should('exist')
    inputsPage.datePickerTo().should('have.value', new Date().toLocaleDateString('en-gb', { dateStyle: 'short' }))
    inputsPage.caseReferenceTextbox().should('exist')
    inputsPage.caseReferenceTextbox().should('have.value', '')
    inputsPage.continueButton().should('exist')
  })

  it('Submits user inputs and redirects to /services', () => {
    cy.intercept({
      method: 'POST',
      url: '/save-inputs',
    }).as('saveInputs')
    cy.signIn()
    cy.visit('/inputs')
    const inputsPage = Page.verifyOnPage(InputsPage)
    inputsPage.datePickerFrom().clear().type('01/01/2001')
    inputsPage.datePickerTo().clear().type('01/01/2021')
    inputsPage.caseReferenceTextbox().clear().type('exampleCaseReference')
    inputsPage.continueButton().click()
    cy.wait('@saveInputs').then(interception => {
      cy.wrap(interception.request.body)
        .should('include', 'dateFrom=')
        .and('include', 'dateTo=')
        .and('include', 'caseReference=')
    })
    cy.url().should('to.match', /services$/)
  })

  it('Persists user inputs when returning to inputs page', () => {
    cy.signIn()
    cy.visit('/inputs')
    let inputsPage = Page.verifyOnPage(InputsPage)
    inputsPage.datePickerFrom().clear().type('01/01/2001')
    inputsPage.datePickerTo().clear().type('01/01/2021')
    inputsPage.caseReferenceTextbox().clear().type('exampleCaseReference')
    inputsPage.continueButton().click()
    cy.visit('/inputs')
    inputsPage = Page.verifyOnPage(InputsPage)
    inputsPage.datePickerFrom().should('have.value', '01/01/2001')
    inputsPage.datePickerTo().should('have.value', '01/01/2021')
    inputsPage.caseReferenceTextbox().should('have.value', 'exampleCaseReference')
  })
})
