import Page from '../pages/page'
import AuthSignInPage from '../pages/authSignIn'
import SummaryPage from '../pages/summary'
import ServiceSelectionPage from '../pages/serviceSelection'
import InputsPage from '../pages/inputs'

context('Summary', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
  })

  // All pages direct users to auth
  it('Unauthenticated user navigating to summary page directed to auth', () => {
    cy.visit('/summary')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Summary page exists', () => {
    cy.signIn()
    cy.visit('/summary')
    // Needed to add a link from index.njk for this to work
  })

  it('Summary page title is HMPPS SAR UI', () => {
    cy.signIn()
    cy.visit('/summary')
    cy.title().should('eq', 'Hmpps Subject Access Request Ui')
  })

  it('Results box exists', () => {
    cy.signIn()
    cy.visit('/summary')
    const summaryPage = Page.verifyOnPage(SummaryPage)
    summaryPage.reportSummaryBox().should('exist')
  })

  it('Accept and confirm button exists', () => {
    cy.signIn()
    cy.visit('/summary')
    const summaryPage = Page.verifyOnPage(SummaryPage)
    summaryPage.acceptConfirmButton().should('exist')
  })

  it('Details summarised include prisoner name', () => {
    cy.signIn()
    cy.visit('/summary')
    const summaryPage = Page.verifyOnPage(SummaryPage)
    summaryPage.reportSummaryBox().contains('Name')
  })

  it('Details summarised include prisoner number', () => {
    cy.signIn()
    cy.visit('/summary')
    const summaryPage = Page.verifyOnPage(SummaryPage)
    summaryPage.reportSummaryBox().contains('Prisoner number')
  })

  it('Details summarised include prisoner DOB', () => {
    cy.signIn()
    cy.visit('/summary')
    const summaryPage = Page.verifyOnPage(SummaryPage)
    summaryPage.reportSummaryBox().contains('Date of Birth')
  })

  it('Details summarised include case ID', () => {
    cy.signIn()
    cy.visit('/summary')
    const summaryPage = Page.verifyOnPage(SummaryPage)
    summaryPage.reportSummaryBox().contains('Case ID')
  })

  it('Details summarised include date range', () => {
    cy.signIn()
    cy.visit('/summary')
    const summaryPage = Page.verifyOnPage(SummaryPage)
    summaryPage.reportSummaryBox().contains('Query date range')
  })

  it('Details summarised include selected services', () => {
    cy.signIn()
    cy.visit('/summary')
    const summaryPage = Page.verifyOnPage(SummaryPage)
    summaryPage.reportSummaryBox().contains('Services selected')
  })

  it('Case ID can be edited at /inputs', () => {
    cy.signIn()
    cy.visit('/summary')
    const summaryPage = Page.verifyOnPage(SummaryPage)
    summaryPage.reportSummaryBox().get('#change-case-id').click()
    cy.location('pathname').should('eq', '/inputs')
  })

  it('Date range can be edited at /inputs', () => {
    cy.signIn()
    cy.visit('/summary')
    const summaryPage = Page.verifyOnPage(SummaryPage)
    summaryPage.reportSummaryBox().get('#change-date-range').click()
    cy.location('pathname').should('eq', '/inputs')
  })

  it('Selected services can be edited at /serviceselection', () => {
    cy.signIn()
    cy.visit('/summary')
    const summaryPage = Page.verifyOnPage(SummaryPage)
    summaryPage.reportSummaryBox().get('#change-services').click()
    cy.location('pathname').should('eq', '/serviceselection')
  })

  it('Selected services are carried through from /serviceselection', () => {
    cy.signIn()
    cy.visit('/serviceselection')
    const serviceSelectionPage = Page.verifyOnPage(ServiceSelectionPage)
    serviceSelectionPage.checkAllCheckBox().click()
    serviceSelectionPage.submitButton().click()
    const summaryPage = Page.verifyOnPage(SummaryPage)
    summaryPage.reportSummaryBox().contains('TestService1')
  })

  it('Details are carried through from /inputs', () => {
    cy.signIn()
    cy.visit('/inputs')
    const inputsPage = Page.verifyOnPage(InputsPage)
    inputsPage.datePickerFrom().clear().type('01/01/2001')
    inputsPage.datePickerTo().clear().type('01/01/2021')
    inputsPage.caseReferenceTextbox().clear().type('exampleCaseReference')
    inputsPage.continueButton().click()
    const serviceSelectionPage = Page.verifyOnPage(ServiceSelectionPage)
    serviceSelectionPage.checkAllCheckBox().click()
    serviceSelectionPage.submitButton().click()
    const summaryPage = Page.verifyOnPage(SummaryPage)
    summaryPage.reportSummaryBox().contains('exampleCaseReference')
    summaryPage.reportSummaryBox().contains('01/01/2001')
  })

  it('Disclaimer text on page', () => {
    cy.signIn()
    cy.visit('/summary')
    Page.verifyOnPage(SummaryPage)
    cy.contains(
      'By accepting these details you are confirming that, to the best of your knowledge, these details are correct.',
    )
  })
})
