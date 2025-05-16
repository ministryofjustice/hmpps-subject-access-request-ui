import Page, { PageElement } from './page'

export default class AdminReportsPage extends Page {
  constructor() {
    super('Reports Admin')
  }

  countTable = (): PageElement => cy.get('.govuk-table').eq(0)

  reportsTable = (): PageElement => cy.get('.govuk-table').eq(1)

  sortByDateButton = (): PageElement => cy.get('button:contains("Date of request")')

  countTableCell = (): PageElement =>
    cy.get('.govuk-table__body').eq(0).find('.govuk-table__row').eq(0).find('.govuk-table__cell')

  reportsTableRow = (): PageElement => cy.get('.govuk-table__body').eq(1).find('.govuk-table__row')

  searchBox = (): PageElement => cy.get('#keyword')

  filterCheckbox = (): PageElement => cy.get('.govuk-checkboxes__item')

  filterCheckboxInput = (): PageElement => cy.get('.govuk-checkboxes__input')

  searchButton = (): PageElement => cy.get('.govuk-button')

  reportsTableDetailsLink = (): PageElement => cy.get('.govuk-table__body').eq(1).find('.govuk-link').eq(1)
}
