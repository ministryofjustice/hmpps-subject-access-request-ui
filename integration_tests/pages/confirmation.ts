import Page, { PageElement } from './page'

export default class ConfirmationPage extends Page {
  constructor() {
    super('has been submitted')
  }

  confirmationPanel = (): PageElement => cy.get('#confirmation-panel')

  nextSteps = (): PageElement => cy.get('#next-steps')

  viewReportsLink = (): PageElement => cy.get('#view-reports')
}
