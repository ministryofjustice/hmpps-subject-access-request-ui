import Page, { PageElement } from './page'

export default class IdentifySubjectPage extends Page {
  constructor() {
    super('ID for the subject')
  }

  identifierTextBox = (): PageElement => cy.get('#input-identifier')

  identifierHint = (): PageElement => cy.get('#input-identifier-hint')

  additionalInformation = (): PageElement => cy.get('#additional-information')

  continueButton = (): PageElement => cy.get('#identify-subject-continue')
}
