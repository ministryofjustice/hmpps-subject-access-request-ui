import Page from '../pages/page'
import AuthSignInPage from '../pages/authSignIn'
import ReportsPage from '../pages/reports'

context('Reports', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetReports', [
      {
        uuid: 'ae6f396d-f1b1-460b-8d13-9a5f3e569c1a',
        dateOfRequest: '2024-12-01',
        sarCaseReference: '1-casereference',
        subjectId: 'A1234AA',
        status: 'Pending',
      },
      {
        uuid: '1e130369-f3fb-46ab-8855-abd621d0b032',
        dateOfRequest: '2023-07-30',
        sarCaseReference: '2-casereference',
        subjectId: 'B2345BB',
        status: 'Completed',
      },
      {
        uuid: '756689d0-4a0b-405c-bf0c-312f11f9f1b7',
        dateOfRequest: '2022-12-30',
        sarCaseReference: '3-casereference',
        subjectId: 'C3456CC',
        status: 'Completed',
      },
    ])
    cy.task('stubGetTotalReports', 56)
  })

  it('Redirects to auth if requested by unauthenticated user', () => {
    cy.visit('/reports')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Renders for authenticated users', () => {
    cy.signIn()
    cy.visit('/reports')
  })

  it('Displays table of reports', () => {
    cy.signIn()
    cy.visit('/reports')
    const reportsPage = Page.verifyOnPage(ReportsPage)
    reportsPage.reportsTable().should('exist')
    reportsPage.reportsTable().contains('Date of request')
    reportsPage.reportsTable().contains('Case Reference')
    reportsPage.reportsTable().contains('Subject ID')
    reportsPage.reportsTable().contains('Status')
  })

  it('Displays search box for filtering', () => {
    cy.signIn()
    cy.visit('/reports')
    const reportsPage = Page.verifyOnPage(ReportsPage)
    reportsPage.searchBox().should('exist')
  })

  it('Can be sorted on date of request', () => {
    cy.signIn()
    cy.visit('/reports')
    const reportsPage = Page.verifyOnPage(ReportsPage)
    reportsPage.reportsTableRow().first().contains('2024-12-01')
    reportsPage.sortByDateButton().click()
    reportsPage.reportsTableRow().first().contains('2022-12-30')
  })
})
