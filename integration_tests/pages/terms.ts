import Page, { PageElement } from './page'

export default class TermsPage extends Page {
  constructor() {
    super('Terms and conditions')
  }

  termsAndConditions = (): PageElement => cy.get('.terms-and-conditions-text')

  linkToHomepage = (): PageElement => cy.get('.govuk-back-link')
}
