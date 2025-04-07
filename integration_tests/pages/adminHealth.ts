import Page, { PageElement } from './page'

export default class AdminHealthPage extends Page {
  constructor() {
    super('Health')
  }

  documentStoreHealthTable = (): PageElement => cy.get('.govuk-table').eq(0)

  documentStoreRow = (rowNumber: number): PageElement =>
    this.documentStoreHealthTable().find('tbody .govuk-table__row').eq(rowNumber)

  lookupServicesHealthTable = (): PageElement => cy.get('.govuk-table').eq(1)

  lookupServicesRow = (rowNumber: number): PageElement =>
    this.lookupServicesHealthTable().find('tbody .govuk-table__row').eq(rowNumber)

  sarServicesHealthTable = (): PageElement => cy.get('.govuk-table').eq(2)

  sarServicesRow = (rowNumber: number): PageElement =>
    this.sarServicesHealthTable().find('tbody .govuk-table__row').eq(rowNumber)
}
