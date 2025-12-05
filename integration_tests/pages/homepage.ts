import Page, { PageElement } from './page'

export default class Homepage extends Page {
  constructor() {
    super('Subject Access Request Product')
  }

  sarActionCards = (): PageElement => cy.get('.sar-card-group')

  requestReportLink = (): PageElement => cy.get('#request-a-report')

  viewReportsLink = (): PageElement => cy.get('#view-reports')

  adminLink = (): PageElement => cy.get('#admin')

  headerUserName = (): PageElement => cy.get('[data-qa=header-user-name]')

  headerPhaseBanner = (): PageElement => cy.get('[data-qa=header-phase-banner]')
}
