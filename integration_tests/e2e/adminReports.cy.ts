import Page from '../pages/page'
import AuthSignInPage from '../pages/authSignIn'
import AdminReportsPage from '../pages/adminReports'
import AdminDetailsPage from '../pages/adminDetails'
import AuthErrorPage from '../pages/authError'

context('Admin Reports', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { roles: ['ROLE_SAR_ADMIN_ACCESS'] })
    cy.task('stubGetSubjectAccessRequestAdminSummary', {
      requests: [
        {
          id: 'aaaaaaaa-cb77-4c0e-a4de-1efc0e86ff34',
          status: 'Pending',
          dateFrom: '2024-03-01',
          dateTo: '2024-03-12',
          sarCaseReferenceNumber: 'caseRef1',
          services: 'hmpps-activities-management-api, keyworker-api, hmpps-manage-adjudications-api',
          nomisId: '',
          ndeliusCaseReferenceId: 'A123456',
          requestedBy: 'user',
          requestDateTime: '2024-03-12T13:52:40.14177',
          claimDateTime: '2024-03-27T14:49:08.67033',
          claimAttempts: 1,
          objectUrl: null,
          lastDownloaded: '2024-03-28T16:33:27.84934',
          durationHumanReadable: '6h',
          appInsightsEventsUrl: 'http://appinsights',
        },
        {
          id: 'bbbbbbbb-cb77-4c0e-a4de-1efc0e86ff34',
          status: 'Completed',
          dateFrom: '2023-03-01',
          dateTo: '2023-03-12',
          sarCaseReferenceNumber: 'caseRef2',
          services: 'hmpps-activities-management-api, keyworker-api, hmpps-manage-adjudications-api',
          nomisId: '',
          ndeliusCaseReferenceId: 'A123456',
          requestedBy: 'user',
          requestDateTime: '2023-03-12T13:52:40.14177',
          claimDateTime: '2023-03-27T14:49:08.67033',
          claimAttempts: 1,
          objectUrl: null,
          lastDownloaded: null,
          durationHumanReadable: '7h',
          appInsightsEventsUrl: 'http://appinsights',
        },
        {
          id: 'cccccccc-cb77-4c0e-a4de-1efc0e86ff34',
          status: 'Errored',
          dateFrom: '2022-03-01',
          dateTo: '2022-03-12',
          sarCaseReferenceNumber: 'caseRef3',
          services: 'hmpps-activities-management-api, keyworker-api, hmpps-manage-adjudications-api',
          nomisId: '',
          ndeliusCaseReferenceId: 'A123456',
          requestedBy: 'user',
          requestDateTime: '2022-03-12T13:52:40.14177',
          claimDateTime: '2022-03-27T14:49:08.67033',
          claimAttempts: 1,
          objectUrl: null,
          lastDownloaded: null,
          durationHumanReadable: '8h',
          appInsightsEventsUrl: 'http://appinsights',
        },
      ],
      filterCount: 3,
      totalCount: 15,
      completedCount: 8,
      erroredCount: 6,
      overdueCount: 4,
      pendingCount: 2,
    })
  })

  it('Redirects to auth if requested by unauthenticated user', () => {
    cy.visit('/admin/reports')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Redirects to authError if requested by user without appropriate role', () => {
    cy.task('stubSignIn', { roles: ['ROLE_SAR_USER_ACCESS'] })
    cy.signIn()
    cy.visit('/admin/reports', { failOnStatusCode: false })
    Page.verifyOnPage(AuthErrorPage)
  })

  it('Redirects to authError if view admin details by user without appropriate role', () => {
    cy.task('stubSignIn', { roles: ['ROLE_SAR_USER_ACCESS'] })
    cy.signIn()
    cy.visit('/admin/details?id=aaaaaaaa-cb77-4c0e-a4de-1efc0e86ff34', { failOnStatusCode: false })
    Page.verifyOnPage(AuthErrorPage)
  })

  it('Renders for authenticated users', () => {
    cy.signIn()
    cy.visit('/admin/reports')
    Page.verifyOnPage(AdminReportsPage)
  })

  it('Displays report counts', () => {
    cy.signIn()
    cy.visit('/admin/reports')
    const adminPage = Page.verifyOnPage(AdminReportsPage)
    adminPage.countTable().should('exist')
    adminPage.countTable().contains('All')
    adminPage.countTable().contains('Completed')
    adminPage.countTable().contains('Errored')
    adminPage.countTable().contains('Overdue')
    adminPage.countTable().contains('Pending')
    adminPage.countTableCell().eq(0).contains('15')
    adminPage.countTableCell().eq(1).contains('8')
    adminPage.countTableCell().eq(2).contains('6')
    adminPage.countTableCell().eq(3).contains('4')
    adminPage.countTableCell().eq(4).contains('2')
  })

  it('Displays table of reports', () => {
    cy.signIn()
    cy.visit('/admin/reports')
    const adminPage = Page.verifyOnPage(AdminReportsPage)
    adminPage.reportsTable().should('exist')
    adminPage.reportsTable().contains('Date of request')
    adminPage.reportsTable().contains('Case Reference')
    adminPage.reportsTable().contains('Subject ID')
    adminPage.reportsTable().contains('Status')
    adminPage.reportsTable().contains('Duration')
    adminPage.reportsTable().contains('AppInsights')
  })

  it('Displays search input and checkboxes for filtering', () => {
    cy.signIn()
    cy.visit('/admin/reports')
    const adminPage = Page.verifyOnPage(AdminReportsPage)
    adminPage.searchBox().should('exist')
    adminPage.filterCheckbox().eq(0).should('exist').contains('Completed')
    adminPage.filterCheckbox().eq(1).should('exist').contains('Errored')
    adminPage.filterCheckbox().eq(2).should('exist').contains('Overdue')
    adminPage.filterCheckbox().eq(3).should('exist').contains('Pending')
    adminPage.searchButton().should('exist').contains('Search')
  })

  it('Can search and filter reports', () => {
    cy.signIn()
    cy.visit('/admin/reports')
    const adminPage = Page.verifyOnPage(AdminReportsPage)
    adminPage.searchBox().type('123')
    adminPage.filterCheckboxInput().eq(0).click()
    adminPage.filterCheckboxInput().eq(1).click()
    adminPage.filterCheckboxInput().eq(2).click()
    adminPage.filterCheckboxInput().eq(3).click()
    adminPage.searchButton().click().wait(1000)
    adminPage.searchBox().should('have.value', '123')
    adminPage.filterCheckboxInput().eq(0).should('be.checked')
    adminPage.filterCheckboxInput().eq(1).should('be.checked')
    adminPage.filterCheckboxInput().eq(2).should('be.checked')
    adminPage.filterCheckboxInput().eq(3).should('be.checked')
  })

  it('Can be sorted on date of request', () => {
    cy.signIn()
    cy.visit('/admin/reports')
    const adminPage = Page.verifyOnPage(AdminReportsPage)
    adminPage.reportsTableRow().first().contains('12/03/2024')
    adminPage.sortByDateButton().click()
    adminPage.reportsTableRow().first().contains('12/03/2022')
  })

  it('Can navigate to request details', () => {
    cy.signIn()
    cy.visit('/admin/reports')
    const adminPage = Page.verifyOnPage(AdminReportsPage)
    adminPage.reportsTableDetailsLink().click()
    Page.verifyOnPage(AdminDetailsPage)
  })

  it('Displays request details', () => {
    cy.signIn()
    cy.visit('/admin/reports')
    const reportsPage = Page.verifyOnPage(AdminReportsPage)
    reportsPage.reportsTableDetailsLink().first().click()
    const detailsPage = Page.verifyOnPage(AdminDetailsPage)
    detailsPage.summaryRow().eq(0).contains('ID')
    detailsPage.summaryRow().eq(0).contains('aaaaaaaa-cb77-4c0e-a4de-1efc0e86ff34')
    detailsPage.summaryRow().eq(1).contains('Subject ID')
    detailsPage.summaryRow().eq(1).contains('A123456')
    detailsPage.summaryRow().eq(2).contains('Case ID')
    detailsPage.summaryRow().eq(2).contains('caseRef1')
    detailsPage.summaryRow().eq(3).contains('Query date from')
    detailsPage.summaryRow().eq(3).contains('1 March 2024')
    detailsPage.summaryRow().eq(4).contains('Query date to')
    detailsPage.summaryRow().eq(4).contains('12 March 2024')
    detailsPage.summaryRow().eq(5).contains('Requested by')
    detailsPage.summaryRow().eq(5).contains('user')
    detailsPage.summaryRow().eq(6).contains('Requested date time')
    detailsPage.summaryRow().eq(6).contains('12 March 2024 at 13:52:40 UTC')
    detailsPage.summaryRow().eq(7).contains('Services selected')
    detailsPage.summaryRow().eq(7).contains('hmpps-activities-management-api')
    detailsPage.summaryRow().eq(7).contains('keyworker-api')
    detailsPage.summaryRow().eq(7).contains('hmpps-manage-adjudications-api')
    detailsPage.summaryRow().eq(8).contains('Status')
    detailsPage.summaryRow().eq(8).contains('Pending')
    detailsPage.summaryRow().eq(9).contains('Claim date time')
    detailsPage.summaryRow().eq(9).contains('27 March 2024 at 14:49:08 UTC')
    detailsPage.summaryRow().eq(10).contains('Claim attempts')
    detailsPage.summaryRow().eq(10).contains('1')
    detailsPage.summaryRow().eq(11).contains('Last downloaded')
    detailsPage.summaryRow().eq(11).contains('28 March 2024 at 16:33:27 UTC')
    detailsPage.successPanel().should('not.exist')
    detailsPage.errorSummary().should('not.exist')
  })

  it('Displays restart button for errored request only', () => {
    cy.signIn()
    cy.visit('/admin/reports')
    const reportsPage = Page.verifyOnPage(AdminReportsPage)
    reportsPage.reportsTableDetailsLink(0).click()
    const detailsPage = Page.verifyOnPage(AdminDetailsPage)
    detailsPage.summaryRow().eq(8).contains('Pending')
    detailsPage.restartButton().should('not.exist')
    detailsPage.backLink().click()
    reportsPage.reportsTableDetailsLink(1).click()
    detailsPage.summaryRow().eq(8).contains('Completed')
    detailsPage.restartButton().should('not.exist')
    detailsPage.backLink().click()
    reportsPage.reportsTableDetailsLink(2).click()
    detailsPage.summaryRow().eq(8).contains('Errored')
    detailsPage.restartButton().should('exist')
    detailsPage.restartButton().contains('Restart')
  })

  it('Can restart request successfully', () => {
    cy.signIn()
    cy.task('stubRestartSubjectAccessRequest', {
      sarId: 'cccccccc-cb77-4c0e-a4de-1efc0e86ff34',
      responseStatus: 200,
      responseMessage: '',
    })
    cy.visit('/admin/reports')
    const reportsPage = Page.verifyOnPage(AdminReportsPage)
    reportsPage.reportsTableDetailsLink(2).click()
    const detailsPage = Page.verifyOnPage(AdminDetailsPage)
    detailsPage.summaryRow().eq(8).contains('Errored')
    detailsPage.restartButton().click()
    const reloadedDetailsPage = Page.verifyOnPage(AdminDetailsPage)
    reloadedDetailsPage.summaryRow().eq(0).contains('cccccccc-cb77-4c0e-a4de-1efc0e86ff34')
    reloadedDetailsPage.successPanel().should('exist')
    reloadedDetailsPage.successPanel().contains('Request restarted successfully')
    reloadedDetailsPage.errorSummary().should('not.exist')
  })

  it('Restart request when error', () => {
    cy.signIn()
    cy.task('stubRestartSubjectAccessRequest', {
      sarId: 'cccccccc-cb77-4c0e-a4de-1efc0e86ff34',
      responseStatus: 400,
      responseMessage: 'test error message',
    })
    cy.visit('/admin/reports')
    const reportsPage = Page.verifyOnPage(AdminReportsPage)
    reportsPage.reportsTableDetailsLink(2).click()
    const detailsPage = Page.verifyOnPage(AdminDetailsPage)
    detailsPage.summaryRow().eq(8).contains('Errored')
    detailsPage.restartButton().click()
    const reloadedDetailsPage = Page.verifyOnPage(AdminDetailsPage)
    reloadedDetailsPage.summaryRow().eq(0).contains('cccccccc-cb77-4c0e-a4de-1efc0e86ff34')
    reloadedDetailsPage.successPanel().should('not.exist')
    reloadedDetailsPage.errorSummary().should('exist')
    reloadedDetailsPage.errorSummary().contains('There was a problem restarting the subject access request:')
    reloadedDetailsPage.errorSummary().contains('test error message')
  })
})
