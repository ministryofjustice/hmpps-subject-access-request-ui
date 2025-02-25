import Page, { PageElement } from './page'

export default class AdminPage extends Page {
  constructor() {
    super('Subject Access Request Admin')
  }

  reportsTable = (): PageElement => cy.get('.govuk-table')

  sortByDateButton = (): PageElement => cy.get('button:contains("Date of request")')

  reportsTableRow = (): PageElement => cy.get('.govuk-table__body').find('.govuk-table__row')

  searchBox = (): PageElement => cy.get('#keyword')

  reportsTableDetailsLink = (): PageElement => cy.get('.govuk-table__body').find('.govuk-link')
}
