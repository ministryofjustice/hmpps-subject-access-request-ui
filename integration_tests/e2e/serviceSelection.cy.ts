import Page from '../pages/page'
import ServiceSelectionPage from '../pages/serviceSelection'
import AuthSignInPage from '../pages/authSignIn'
import InputsPage from '../pages/inputs'

context('ServiceSelection', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubServiceList', [
      {
        id: 351,
        name: 'hmpps-prisoner-search',
        environments: [{ id: 47254, url: 'https://prisoner-search-dev.prison.service.justice.gov.uk' }],
      },
      { id: 211, name: 'hmpps-book-secure-move-api', environments: [] },
      {
        id: 175,
        name: 'hmpps-prisoner-search-indexer',
        environments: [{ id: 47270, url: 'https://prisoner-search-indexer-dev.prison.service.justice.gov.uk' }],
      },
    ])
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
    serviceSelectionPage.checkAllCheckBox().click()
    cy.get('.govuk-moj-multi-select__checkbox__input').should('be.checked')
  })

  it('Uncheck all service when checkAll clicked twice', () => {
    cy.signIn()
    cy.visit('/service-selection')
    const serviceSelectionPage = Page.verifyOnPage(ServiceSelectionPage)
    serviceSelectionPage.checkAllCheckBox().click()
    serviceSelectionPage.checkAllCheckBox().click()
    cy.get('.govuk-moj-multi-select__checkbox__input').should('not.be.checked')
  })

  it('Persists selected service when user returning to ServiceSelect page', () => {
    cy.signIn()
    cy.visit('/service-selection')
    const serviceSelectionPage = Page.verifyOnPage(ServiceSelectionPage)
    serviceSelectionPage.checkAllCheckBox().click()
    serviceSelectionPage.submitButton().click()
    cy.visit('/service-selection')
    cy.get('.govuk-moj-multi-select__checkbox__input').should('be.checked')
  })

  it('Raises error message if no services found', () => {
    cy.task('stubServiceList', [])
    cy.signIn()
    cy.visit('/service-selection')
    const serviceSelectionPage = Page.verifyOnPage(ServiceSelectionPage)
    serviceSelectionPage.errorSummaryBox().should('be.visible')
  })

  it('redirects to inputs page when back link is clicked', () => {
    cy.signIn()
    cy.visit('/service-selection')
    const serviceSelectionPage = Page.verifyOnPage(ServiceSelectionPage)
    serviceSelectionPage.backLink().click()
    Page.verifyOnPage(InputsPage)
  })
})
