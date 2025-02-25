import Page, { PageElement } from './page'

export default class AdminDetailsPage extends Page {
  constructor() {
    super('Subject Access Request Details')
  }

  summaryRow = (): PageElement => cy.get('.govuk-summary-list').find('.govuk-summary-list__row')
}
