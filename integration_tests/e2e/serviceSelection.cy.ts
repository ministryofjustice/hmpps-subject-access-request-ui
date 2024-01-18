import Page from '../pages/page'
import ServiceSelectionPage from '../pages/serviceSelection'
import AuthSignInPage from '../pages/authSignIn'

context('ServiceSelection', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.intercept({
      method: 'POST',
      url: '/serviceselection',
    }).as('selectServices')
    cy.intercept({
      method: 'GET',
      url: '/serviceselection',
    }).as('getServices')
  })

  it('Unauthenticated user navigating to serviceselection page directed to auth', () => {
    cy.visit('/serviceselection')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Returns a response', () => {
    cy.request('/serviceselection').its('body').should('exist')
  })

  it('Contains check all Checkbox', () => {
    cy.signIn()
    cy.visit('/serviceselection')
    // cy.wait('@getServices')
    const serviceSelectionPage = Page.verifyOnPage(ServiceSelectionPage)
    serviceSelectionPage.checkAllCheckBox().should('exist')
    serviceSelectionPage.submitButton().should('exist')
  })

  it('Does not allow none service selected', () => {
    cy.signIn()
    cy.visit('/serviceselection')
    const serviceSelectionPage = Page.verifyOnPage(ServiceSelectionPage)
    serviceSelectionPage.submitButton().click()
    cy.wait('@selectServices')
    cy.url().should('to.match', /serviceselection$/)
    serviceSelectionPage.errorSummaryBox().should('be.visible')
  })

  it('Check all service when checkAll clicked once', () => {
    cy.signIn()
    cy.visit('/serviceselection')
    // cy.wait('@getServices')
    const serviceSelectionPage = Page.verifyOnPage(ServiceSelectionPage)
    serviceSelectionPage.checkAllCheckBox().click()
    cy.get('.govuk-moj-multi-select__checkbox__input').should('be.checked')
  })

  it('Uncheck all service when checkAll clicked twice', () => {
    cy.signIn()
    cy.visit('/serviceselection')
    // cy.wait('@getServices')
    const serviceSelectionPage = Page.verifyOnPage(ServiceSelectionPage)
    serviceSelectionPage.checkAllCheckBox().click()
    serviceSelectionPage.checkAllCheckBox().click()
    cy.get('.govuk-moj-multi-select__checkbox__input').should('not.be.checked')
  })

  it('Persists selected service when user returning to ServiceSelect page', () => {
    cy.signIn()
    cy.visit('/serviceselection')
    // cy.wait('@getServices')
    const serviceSelectionPage = Page.verifyOnPage(ServiceSelectionPage)
    serviceSelectionPage.checkAllCheckBox().click()
    serviceSelectionPage.submitButton().click()
    cy.visit('/serviceselection')
    cy.get('.govuk-moj-multi-select__checkbox__input').should('be.checked')
  })
})
