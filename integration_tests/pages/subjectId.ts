import Page, { PageElement } from './page'

export default class SubjectIdPage extends Page {
  constructor() {
    super('ID for the subject')
  }

  idTextBox = (): PageElement => cy.get('#subject-id')

  idHint = (): PageElement => cy.get('#subject-id-hint')

  additionalInformation = (): PageElement => cy.get('#additional-information')

  continueButton = (): PageElement => cy.get('#subject-id-continue')
}
