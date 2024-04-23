import AuthSignInPage from '../pages/authSignIn'
import InputsPage from '../pages/inputs'
import Page from '../pages/page'
import SubjectIdPage from '../pages/subjectId'

context('Inputs', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.intercept({
      method: 'POST',
      url: '/inputs',
    }).as('saveInputs')
  })

  it('Unauthenticated user navigating to inputs page directed to auth', () => {
    cy.visit('/inputs')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Returns a response', () => {
    cy.request('/inputs').its('body').should('exist')
  })

  it('Contains all necessary input components with default values', () => {
    cy.signIn()
    cy.visit('/inputs')
    const inputsPage = Page.verifyOnPage(InputsPage)
    inputsPage.datePickerFrom().should('exist')
    inputsPage.datePickerFrom().should('have.value', '')
    inputsPage.datePickerTo().should('exist')
    inputsPage.datePickerTo().should('have.value', new Date().toLocaleDateString('en-gb', { dateStyle: 'short' }))
    inputsPage.caseReferenceTextbox().should('exist')
    inputsPage.caseReferenceTextbox().should('have.value', '')
    inputsPage.continueButton().should('exist')
  })

  it('Submits user inputs and redirects to /service-selection', () => {
    cy.signIn()
    cy.visit('/subject-id')
    const subjectIdPage = Page.verifyOnPage(SubjectIdPage)
    subjectIdPage.idTextBox().clear().type('A1111AA')
    subjectIdPage.continueButton().click()
    cy.visit('/inputs')
    const inputsPage = Page.verifyOnPage(InputsPage)
    inputsPage.datePickerFrom().clear().type('01/01/2001')
    inputsPage.datePickerTo().clear().type('01/01/2021')
    inputsPage.caseReferenceTextbox().clear().type('exampleCaseReference')
    inputsPage.continueButton().click()
    cy.wait('@saveInputs').then(interception => {
      cy.wrap(interception.request.body)
        .should('include', 'dateFrom=')
        .and('include', 'dateTo=')
        .and('include', 'caseReference=')
    })
    cy.url().should('to.match', /service-selection$/)
  })

  it('Persists user inputs when returning to inputs page', () => {
    cy.signIn()
    cy.visit('/subject-id')
    const subjectIdPage = Page.verifyOnPage(SubjectIdPage)
    subjectIdPage.idTextBox().clear().type('A1111AA')
    subjectIdPage.continueButton().click()
    cy.visit('/inputs')
    let inputsPage = Page.verifyOnPage(InputsPage)
    inputsPage.datePickerFrom().clear().type('01/01/2001')
    inputsPage.datePickerTo().clear().type('01/01/2021')
    inputsPage.caseReferenceTextbox().clear().type('exampleCaseReference')
    inputsPage.continueButton().click()
    cy.visit('/inputs')
    inputsPage = Page.verifyOnPage(InputsPage)
    inputsPage.datePickerFrom().should('have.value', '01/01/2001')
    inputsPage.datePickerTo().should('have.value', '01/01/2021')
    inputsPage.caseReferenceTextbox().should('have.value', 'exampleCaseReference')
  })

  it('Does not allow any invalid dateFrom input', () => {
    const invalidInputs = [
      '01/01/2150', // Future date (Greater than current year)
      '01/13/2022', // Invalid month (Greater than 12)
      '32/01/2022', // Invalid day (Greater than 31)
      '30/02/2023', // Invalid day (30 in February)
      'a/01/2022', // Invalid day (not numeric)
      '01/a/2022', // Invalid month (not numeric)
      '01/01/a', // Invalid year (not numeric)
      'test', // Invalid date
    ]
    cy.signIn()
    cy.visit('/subject-id')
    const subjectIdPage = Page.verifyOnPage(SubjectIdPage)
    subjectIdPage.idTextBox().clear().type('A1111AA')
    subjectIdPage.continueButton().click()
    invalidInputs.forEach(invalidInput => {
      cy.visit('/inputs')
      let inputsPage = Page.verifyOnPage(InputsPage)
      inputsPage.datePickerFrom().clear().type(invalidInput)
      inputsPage.datePickerTo().clear().type('01/01/2021')
      inputsPage.caseReferenceTextbox().clear().type('exampleCaseReference')
      inputsPage.continueButton().click()
      cy.wait('@saveInputs')
      cy.url().should('to.match', /inputs$/)
      inputsPage = Page.verifyOnPage(InputsPage)
      inputsPage.datePickerFrom().should('have.value', invalidInput)
      inputsPage.datePickerTo().should('have.value', '01/01/2021')
      inputsPage.caseReferenceTextbox().should('have.value', 'exampleCaseReference')
      inputsPage.errorSummaryBox().should('exist')
    })
  })

  it('Does not allow any invalid dateTo input', () => {
    const invalidInputs = [
      '01/01/2150', // Future date (Greater than current year)
      '01/13/2022', // Invalid month (Greater than 12)
      '32/01/2022', // Invalid day (Greater than 31)
      '30/02/2023', // Invalid day (30 in February)
      'a/01/2022', // Invalid day (not numeric)
      '01/a/2022', // Invalid month (not numeric)
      '01/01/a', // Invalid year (not numeric)
      'test', // Invalid date
    ]
    cy.signIn()
    cy.visit('/subject-id')
    const subjectIdPage = Page.verifyOnPage(SubjectIdPage)
    subjectIdPage.idTextBox().clear().type('A1111AA')
    subjectIdPage.continueButton().click()
    invalidInputs.forEach(invalidInput => {
      cy.visit('/inputs')
      let inputsPage = Page.verifyOnPage(InputsPage)
      inputsPage.datePickerFrom().clear().type('01/01/2001')
      inputsPage.datePickerTo().clear().type(invalidInput)
      inputsPage.caseReferenceTextbox().clear().type('exampleCaseReference')
      inputsPage.continueButton().click()
      cy.wait('@saveInputs')
      cy.url().should('to.match', /inputs$/)
      inputsPage = Page.verifyOnPage(InputsPage)
      inputsPage.datePickerFrom().should('have.value', '01/01/2001')
      inputsPage.datePickerTo().should('have.value', invalidInput)
      inputsPage.caseReferenceTextbox().should('have.value', 'exampleCaseReference')
      inputsPage.errorSummaryBox().should('exist')
    })
  })

  it('Does not allow caseReference to be empty', () => {
    cy.signIn()
    cy.visit('/subject-id')
    const subjectIdPage = Page.verifyOnPage(SubjectIdPage)
    subjectIdPage.idTextBox().clear().type('A1111AA')
    subjectIdPage.continueButton().click()
    cy.visit('/inputs')
    let inputsPage = Page.verifyOnPage(InputsPage)
    inputsPage.datePickerFrom().clear().type('01/01/2001')
    inputsPage.datePickerTo().clear().type('01/01/2021')
    inputsPage.continueButton().click()
    cy.wait('@saveInputs')
    cy.url().should('to.match', /inputs$/)
    inputsPage = Page.verifyOnPage(InputsPage)
    inputsPage.datePickerFrom().should('have.value', '01/01/2001')
    inputsPage.datePickerTo().should('have.value', '01/01/2021')
    inputsPage.errorSummaryBox().should('exist')
  })

  it('Does not allow any invalid caseReference input', () => {
    const invalidInputs = [
      'abcdefghijklmnopqrstuvwxyz', // Invalid string (Longer than 20 chars)
    ]
    cy.signIn()
    cy.visit('/subject-id')
    const subjectIdPage = Page.verifyOnPage(SubjectIdPage)
    subjectIdPage.idTextBox().clear().type('A1111AA')
    subjectIdPage.continueButton().click()
    invalidInputs.forEach(invalidInput => {
      cy.visit('/inputs')
      let inputsPage = Page.verifyOnPage(InputsPage)
      inputsPage.datePickerFrom().clear().type('01/01/2001')
      inputsPage.datePickerTo().clear().type('01/01/2021')
      inputsPage.caseReferenceTextbox().clear().type(invalidInput)
      inputsPage.continueButton().click()
      cy.wait('@saveInputs')
      cy.url().should('to.match', /inputs$/)
      inputsPage = Page.verifyOnPage(InputsPage)
      inputsPage.datePickerFrom().should('have.value', '01/01/2001')
      inputsPage.datePickerTo().should('have.value', '01/01/2021')
      inputsPage.caseReferenceTextbox().should('have.value', invalidInput)
      inputsPage.errorSummaryBox().should('exist')
    })
  })

  it('Does not allow DateFrom to be after DateTo', () => {
    cy.signIn()
    cy.visit('/subject-id')
    const subjectIdPage = Page.verifyOnPage(SubjectIdPage)
    subjectIdPage.idTextBox().clear().type('A1111AA')
    subjectIdPage.continueButton().click()
    cy.visit('/inputs')
    const inputsPage = Page.verifyOnPage(InputsPage)
    inputsPage.datePickerFrom().clear().type('01/01/2021')
    inputsPage.datePickerTo().clear().type('01/01/2001')
    inputsPage.caseReferenceTextbox().clear().type('exampleCaseReference')
    inputsPage.continueButton().click()
    cy.wait('@saveInputs')
    cy.url().should('to.match', /inputs$/)
  })

  it('redirects to subject ID page when back link is clicked', () => {
    cy.signIn()
    cy.visit('/inputs')
    const inputsPage = Page.verifyOnPage(InputsPage)
    inputsPage.backLink().click()
    Page.verifyOnPage(SubjectIdPage)
  })
})
