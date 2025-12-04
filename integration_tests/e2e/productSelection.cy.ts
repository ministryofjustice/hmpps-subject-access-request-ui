import Page from '../pages/page'
import ProductSelectionPage from '../pages/productSelection'
import AuthSignInPage from '../pages/authSignIn'
import InputsPage from '../pages/inputs'

context('ProductSelection', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { roles: ['ROLE_SAR_USER_ACCESS'] })
    cy.task('stubGetProductsRequest', [
      {
        id: '93381fde-7685-4660-8dd2-59144ad6673f',
        name: 'keyworker-api',
        label: 'Keyworker',
        url: 'https://the-keyworker-api.com',
        order: 1,
        enabled: true,
      },
    ])
  })

  it('Unauthenticated user navigating to productselection page directed to auth', () => {
    cy.visit('/product-selection')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Returns a response', () => {
    cy.request('/product-selection').its('body').should('exist')
  })

  it('Contains check all Checkbox', () => {
    cy.signIn()
    cy.visit('/product-selection')
    const productSelectionPage = Page.verifyOnPage(ProductSelectionPage)
    productSelectionPage.checkAllCheckBox().should('exist')
    productSelectionPage.submitButton().should('exist')
  })

  it('Does not allow none product selected', () => {
    cy.signIn()
    cy.visit('/product-selection')
    const productSelectionPage = Page.verifyOnPage(ProductSelectionPage)
    productSelectionPage.submitButton().click()
    cy.url().should('to.match', /product-selection$/)
    productSelectionPage.errorSummaryBox().should('be.visible')
  })

  it('Check all product when checkAll clicked once', () => {
    cy.signIn()
    cy.visit('/product-selection')
    const productSelectionPage = Page.verifyOnPage(ProductSelectionPage)
    productSelectionPage.checkAllCheckBox().click({ force: true })
    cy.get('.govuk-moj-multi-select__checkbox__input').should('be.checked')
  })

  it('Uncheck all products when checkAll clicked twice', () => {
    cy.signIn()
    cy.visit('/product-selection')
    const productSelectionPage = Page.verifyOnPage(ProductSelectionPage)
    productSelectionPage.checkAllCheckBox().click({ force: true })
    productSelectionPage.checkAllCheckBox().click({ force: true })
    cy.get('.govuk-moj-multi-select__checkbox__input').should('not.be.checked')
  })

  it('Persists selected product when user returning to ProductSelect page', () => {
    cy.signIn()
    cy.visit('/product-selection')
    const productSelectionPage = Page.verifyOnPage(ProductSelectionPage)
    productSelectionPage.checkAllCheckBox().click({ force: true })
    productSelectionPage.submitButton().click()
    cy.visit('/product-selection')
    cy.get('.govuk-moj-multi-select__checkbox__input').should('be.checked')
  })

  it('redirects to inputs page when back link is clicked', () => {
    cy.signIn()
    cy.visit('/product-selection')
    const productSelectionPage = Page.verifyOnPage(ProductSelectionPage)
    productSelectionPage.backLink().click()
    Page.verifyOnPage(InputsPage)
  })
})
