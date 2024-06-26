import Page, { PageElement } from './page'

export default class InputsPage extends Page {
  constructor() {
    super('Enter details')
  }

  errorSummaryBox = (): PageElement => cy.get('.govuk-error-summary')

  datePickerFrom = (): PageElement => cy.get('#input-dateFrom')

  datePickerTo = (): PageElement => cy.get('#input-dateTo')

  caseReferenceTextbox = (): PageElement => cy.get('#input-caseReference')

  continueButton = (): PageElement => cy.get('#input-continue')

  backLink = (): PageElement => cy.get('.govuk-back-link')
}
