import Page, { PageElement } from './page'

export default class ProductSelectionPage extends Page {
  constructor() {
    super('Select Products')
  }

  errorSummaryBox = (): PageElement => cy.get('.govuk-error-summary')

  checkAllCheckBox = (): PageElement => cy.get('#checkboxes-all')

  submitButton = (): PageElement => cy.get('#input-submit')

  backLink = (): PageElement => cy.get('.govuk-back-link')
}
