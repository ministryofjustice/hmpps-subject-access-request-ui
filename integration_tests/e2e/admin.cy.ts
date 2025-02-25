import Page from '../pages/page'
import AuthSignInPage from '../pages/authSignIn'
import AdminPage from '../pages/admin'
import AdminDetailsPage from '../pages/adminDetails'
import AuthErrorPage from '../pages/authError'

context('Admin', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { roles: ['ROLE_SAR_ADMIN_ACCESS'] })
    cy.task('stubGetSubjectAccessRequests', [
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
      },
      {
        id: 'cccccccc-cb77-4c0e-a4de-1efc0e86ff34',
        status: 'Completed',
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
      },
    ])
    cy.task('stubGetTotalSubjectAccessRequests', 3)
  })

  it('Redirects to auth if requested by unauthenticated user', () => {
    cy.visit('/admin')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Redirects to authError if requested by user without appropriate role', () => {
    cy.task('stubSignIn', { roles: ['ROLE_SAR_USER_ACCESS'] })
    cy.signIn()
    cy.visit('/admin', { failOnStatusCode: false })
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
    cy.visit('/admin')
    Page.verifyOnPage(AdminPage)
  })

  it('Displays table of reports', () => {
    cy.signIn()
    cy.visit('/admin')
    const adminPage = Page.verifyOnPage(AdminPage)
    adminPage.reportsTable().should('exist')
    adminPage.reportsTable().contains('Date of request')
    adminPage.reportsTable().contains('Case Reference')
    adminPage.reportsTable().contains('Subject ID')
    adminPage.reportsTable().contains('Status')
  })

  it('Displays search box for filtering', () => {
    cy.signIn()
    cy.visit('/admin')
    const adminPage = Page.verifyOnPage(AdminPage)
    adminPage.searchBox().should('exist')
  })

  it('Can be sorted on date of request', () => {
    cy.signIn()
    cy.visit('/admin')
    const adminPage = Page.verifyOnPage(AdminPage)
    adminPage.reportsTableRow().first().contains('12/03/2024')
    adminPage.sortByDateButton().click()
    adminPage.reportsTableRow().first().contains('12/03/2022')
  })

  it('Can navigate to request details', () => {
    cy.signIn()
    cy.visit('/admin')
    const adminPage = Page.verifyOnPage(AdminPage)
    adminPage.reportsTableDetailsLink().first().click()
    Page.verifyOnPage(AdminDetailsPage)
  })

  it('Displays request details', () => {
    cy.signIn()
    cy.visit('/admin')
    const reportsPage = Page.verifyOnPage(AdminPage)
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
  })
})
