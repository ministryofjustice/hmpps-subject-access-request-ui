import Page, { PageElement } from './page'

export default class AdminDetailsPage extends Page {
  constructor() {
    super('Subject Access Request Details')
  }

  summaryRow = (): PageElement => cy.get('.govuk-summary-list').find('.govuk-summary-list__row')

  restartButton = (): PageElement => cy.get('.govuk-button')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  successPanel = (): PageElement => cy.get('.govuk-panel')

  errorSummary = (): PageElement => cy.get('.govuk-error-summary')
}
