import Page from '../pages/page'
import ServiceSelectionPage from '../pages/serviceSelection'
import AuthSignInPage from '../pages/authSignIn'
import InputsPage from '../pages/inputs'

context('ServiceSelection', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { roles: ['ROLE_SAR_USER_ACCESS'] })
  })

  it('Unauthenticated user navigating to serviceselection page directed to auth', () => {
    cy.visit('/service-selection')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Returns a response', () => {
    cy.request('/service-selection').its('body').should('exist')
  })

  it('Contains check all Checkbox', () => {
    cy.signIn()
    cy.visit('/service-selection')
    const serviceSelectionPage = Page.verifyOnPage(ServiceSelectionPage)
    serviceSelectionPage.checkAllCheckBox().should('exist')
    serviceSelectionPage.submitButton().should('exist')
  })

  it('Does not allow none service selected', () => {
    cy.signIn()
    cy.visit('/service-selection')
    const serviceSelectionPage = Page.verifyOnPage(ServiceSelectionPage)
    serviceSelectionPage.submitButton().click()
    cy.url().should('to.match', /service-selection$/)
    serviceSelectionPage.errorSummaryBox().should('be.visible')
  })

  it('Check all service when checkAll clicked once', () => {
    cy.signIn()
    cy.visit('/service-selection')
    const serviceSelectionPage = Page.verifyOnPage(ServiceSelectionPage)
    serviceSelectionPage.checkAllCheckBox().click({ force: true })
    cy.get('.govuk-moj-multi-select__checkbox__input').should('be.checked')
  })

  it('Uncheck all service when checkAll clicked twice', () => {
    cy.signIn()
    cy.visit('/service-selection')
    const serviceSelectionPage = Page.verifyOnPage(ServiceSelectionPage)
    serviceSelectionPage.checkAllCheckBox().click({ force: true })
    serviceSelectionPage.checkAllCheckBox().click({ force: true })
    cy.get('.govuk-moj-multi-select__checkbox__input').should('not.be.checked')
  })

  it('Persists selected service when user returning to ServiceSelect page', () => {
    cy.signIn()
    cy.visit('/service-selection')
    const serviceSelectionPage = Page.verifyOnPage(ServiceSelectionPage)
    serviceSelectionPage.checkAllCheckBox().click({ force: true })
    serviceSelectionPage.submitButton().click()
    cy.visit('/service-selection')
    cy.get('.govuk-moj-multi-select__checkbox__input').should('be.checked')
  })

  it('redirects to inputs page when back link is clicked', () => {
    cy.signIn()
    cy.visit('/service-selection')
    const serviceSelectionPage = Page.verifyOnPage(ServiceSelectionPage)
    serviceSelectionPage.backLink().click()
    Page.verifyOnPage(InputsPage)
  })
})
