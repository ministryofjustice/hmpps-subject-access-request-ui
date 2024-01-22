import Page, { PageElement } from './page'

export default class SummaryPage extends Page {
  constructor() {
    super('Please confirm report details')
  }

  reportSummaryBox = (): PageElement => cy.get('#report-summary')

  acceptConfirmButton = (): PageElement => cy.get('#accept-confirm')
}
