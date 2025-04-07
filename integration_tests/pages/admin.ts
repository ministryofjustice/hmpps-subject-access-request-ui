import Page, { PageElement } from './page'

export default class AdminPage extends Page {
  constructor() {
    super('Subject Access Request Admin')
  }

  healthLink = (): PageElement => cy.get('.govuk-link--no-visited-state').eq(0)

  reportsLink = (): PageElement => cy.get('.govuk-link--no-visited-state').eq(1)
}
