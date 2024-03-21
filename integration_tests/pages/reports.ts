import Page, { PageElement } from './page'

export default class SubjectIdPage extends Page {
  constructor() {
    super('Subject Access Request Reports')
  }

  reportsTable = (): PageElement => cy.get('.govuk-table')
}
