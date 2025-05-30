import Page from '../pages/page'
import AuthSignInPage from '../pages/authSignIn'
import ReportsPage from '../pages/reports'

context('Reports', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { roles: ['ROLE_SAR_USER_ACCESS'] })
    cy.task('stubGetSubjectAccessRequests', [
      {
        id: 'aaaaaaaa-cb77-4c0e-a4de-1efc0e86ff34',
        status: 'Pending',
        dateFrom: '2024-03-01',
        dateTo: '2024-03-12',
        sarCaseReferenceNumber: 'caseRef1',
        services:
          'hmpps-activities-management-api, https://activities-api-dev.prison.service.justice.gov.uk,keyworker-api, https://keyworker-api-dev.prison.service.justice.gov.uk,hmpps-manage-adjudications-api, https://manage-adjudications-api-dev.hmpps.service.justice.gov.uk',
        nomisId: '',
        ndeliusCaseReferenceId: 'A123456',
        requestedBy: 'user',
        requestDateTime: '2025-03-07T13:52:40.14177',
        claimDateTime: '2025-03-07T14:49:08.67033',
        claimAttempts: 1,
        objectUrl: null,
        lastDownloaded: null,
      },
      {
        id: 'bbbbbbbb-cb77-4c0e-a4de-1efc0e86ff34',
        status: 'Completed',
        dateFrom: '2023-03-01',
        dateTo: '2023-03-12',
        sarCaseReferenceNumber: 'caseRef2',
        services:
          'hmpps-activities-management-api, https://activities-api-dev.prison.service.justice.gov.uk,keyworker-api, https://keyworker-api-dev.prison.service.justice.gov.uk,hmpps-manage-adjudications-api, https://manage-adjudications-api-dev.hmpps.service.justice.gov.uk',
        nomisId: '',
        ndeliusCaseReferenceId: 'A123456',
        requestedBy: 'user',
        requestDateTime: '2023-01-10T13:56:40.14177',
        claimDateTime: '2023-01-10T14:49:08.67033',
        claimAttempts: 1,
        objectUrl: null,
        lastDownloaded: null,
      },
      {
        id: 'cccccccc-cb77-4c0e-a4de-1efc0e86ff34',
        status: 'Completed',
        dateFrom: '2022-03-01',
        dateTo: '2022-03-12',
        sarCaseReferenceNumber: 'caseRef3',
        services:
          'hmpps-activities-management-api, https://activities-api-dev.prison.service.justice.gov.uk,keyworker-api, https://keyworker-api-dev.prison.service.justice.gov.uk,hmpps-manage-adjudications-api, https://manage-adjudications-api-dev.hmpps.service.justice.gov.uk',
        nomisId: '',
        ndeliusCaseReferenceId: 'A123456',
        requestedBy: 'user',
        requestDateTime: '2022-03-07T12:53:40.14177',
        claimDateTime: '2022-03-07T14:49:08.67033',
        claimAttempts: 1,
        objectUrl: null,
        lastDownloaded: null,
      },
    ])
    cy.task('stubGetTotalSubjectAccessRequests', 3)
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
    reportsPage.reportsTableRow().first().contains('07/03/2025 13:52')
    reportsPage.sortByDateButton().click()
    reportsPage.reportsTableRow().first().contains('07/03/2022 12:53')
  })
})
