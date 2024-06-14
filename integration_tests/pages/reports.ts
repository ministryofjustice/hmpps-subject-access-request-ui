import Page, { PageElement } from './page'

export default class SubjectIdPage extends Page {
  constructor() {
    super('Subject Access Request Reports')
  }

  reportsTable = (): PageElement => cy.get('.govuk-table')

  sortByDateButton = (): PageElement => cy.get('button:contains("Date of request")')

  reportsTableRow = (): PageElement => cy.get('.govuk-table__body').find('.govuk-table__row')

  searchBox = (): PageElement => cy.get('#keyword')
}
