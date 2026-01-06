import { expect, test } from '@playwright/test'
import hmppsAuth from '../mockApis/hmppsAuth'

import { ADMIN_ROLE, login, REGISTER_TEMPLATE_ROLE, resetStubs, USER_ROLE, verifyOnPage } from '../testUtils'
import AuthSignInPage from '../pages/authSignInPage'
import AuthErrorPage from '../pages/authErrorPage'
import AdminReportsPage from '../pages/adminReportsPage'
import AdminDetailsPage from '../pages/adminDetailsPage'
import sarAdminApi from '../mockApis/sarAdmin'

test.describe('Admin Reports', () => {
  test.beforeEach(async () => {
    await sarAdminApi.stubGetSubjectAccessRequestAdminSummary()
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Redirects to auth if requested by unauthenticated user', async ({ page }) => {
    await hmppsAuth.stubSignInPage()
    await page.goto('/admin/reports')

    await verifyOnPage(page, AuthSignInPage)
  })

  const unauthorisedRoles = [USER_ROLE, REGISTER_TEMPLATE_ROLE, 'ROLE_OTHER']
  test.describe('Redirects to authError if requested by user without appropriate role', () => {
    unauthorisedRoles.forEach(role => {
      test(`redirects to authError for role ${role} `, async ({ page }) => {
        await login(page, { roles: [role] })
        await page.goto('/admin/reports')

        await verifyOnPage(page, AuthErrorPage)
      })
    })
  })

  test.describe('Redirects to authError if view admin details by user without appropriate role', () => {
    unauthorisedRoles.forEach(role => {
      test(`redirects to authError if view admin details for role ${role} `, async ({ page }) => {
        await login(page, { roles: [role] })
        await page.goto('/admin/details?id=aaaaaaaa-cb77-4c0e-a4de-1efc0e86ff34')

        await verifyOnPage(page, AuthErrorPage)
      })
    })
  })

  test('Renders for authenticated users', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })
    await page.goto('/admin/reports')

    await verifyOnPage(page, AdminReportsPage)
  })

  test('Displays report counts', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })
    await page.goto('/admin/reports')
    const reportsPage = await verifyOnPage(page, AdminReportsPage)

    await expect(reportsPage.countTable).toBeVisible()
    await expect(reportsPage.countTable).toContainText('All')
    await expect(reportsPage.countTable).toContainText('Completed')
    await expect(reportsPage.countTable).toContainText('Errored')
    await expect(reportsPage.countTable).toContainText('Overdue')
    await expect(reportsPage.countTable).toContainText('Pending')
    await expect(reportsPage.countTableCell(0)).toContainText('15')
    await expect(reportsPage.countTableCell(1)).toContainText('8')
    await expect(reportsPage.countTableCell(2)).toContainText('6')
    await expect(reportsPage.countTableCell(3)).toContainText('4')
    await expect(reportsPage.countTableCell(4)).toContainText('2')
  })

  test('Displays table of reports', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })
    await page.goto('/admin/reports')
    const reportsPage = await verifyOnPage(page, AdminReportsPage)

    await expect(reportsPage.reportsTable).toBeVisible()
    await expect(reportsPage.reportsTable).toContainText('Date of request')
    await expect(reportsPage.reportsTable).toContainText('Case Reference')
    await expect(reportsPage.reportsTable).toContainText('Subject ID')
    await expect(reportsPage.reportsTable).toContainText('Status')
    await expect(reportsPage.reportsTable).toContainText('Duration')
    await expect(reportsPage.reportsTable).toContainText('AppInsights')
  })

  test('Displays search input and checkboxes for filtering', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })
    await page.goto('/admin/reports')
    const reportsPage = await verifyOnPage(page, AdminReportsPage)

    await expect(reportsPage.searchBox).toBeVisible()
    await expect(reportsPage.completedFilterCheckbox).toBeVisible()
    await expect(reportsPage.erroredFilterCheckbox).toBeVisible()
    await expect(reportsPage.overdueFilterCheckbox).toBeVisible()
    await expect(reportsPage.pendingFilterCheckbox).toBeVisible()
    await expect(reportsPage.searchButton).toBeVisible()
  })

  test('Can search and filter reports', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })
    await page.goto('/admin/reports')
    const reportsPage = await verifyOnPage(page, AdminReportsPage)
    await reportsPage.searchBox.fill('123')
    await reportsPage.completedFilterCheckbox.click()
    await reportsPage.erroredFilterCheckbox.click()
    await reportsPage.overdueFilterCheckbox.click()
    await reportsPage.pendingFilterCheckbox.click()
    await reportsPage.search()

    await expect(reportsPage.searchBox).toHaveValue('123')
    await expect(reportsPage.completedFilterCheckbox).toBeChecked()
    await expect(reportsPage.erroredFilterCheckbox).toBeChecked()
    await expect(reportsPage.overdueFilterCheckbox).toBeChecked()
    await expect(reportsPage.pendingFilterCheckbox).toBeChecked()
  })

  test('Can be sorted on date of request', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })
    await page.goto('/admin/reports')
    const reportsPage = await verifyOnPage(page, AdminReportsPage)
    await expect(reportsPage.reportsTableRow()).toContainText('12/03/2024')
    await reportsPage.sortByDateButton.click()

    await expect(reportsPage.reportsTableRow()).toContainText('12/03/2022')
  })

  test('Can navigate to request details', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })
    await page.goto('/admin/reports')
    const reportsPage = await verifyOnPage(page, AdminReportsPage)
    await reportsPage.followReportsDetailsLink()

    await verifyOnPage(page, AdminDetailsPage)
  })

  test('Displays request details', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })
    await page.goto('/admin/reports')
    const reportsPage = await verifyOnPage(page, AdminReportsPage)
    await reportsPage.followReportsDetailsLink()
    const detailsPage = await verifyOnPage(page, AdminDetailsPage)

    await expect(detailsPage.idSummaryRow).toBeVisible()
    await expect(detailsPage.idSummaryRow).toContainText('aaaaaaaa-cb77-4c0e-a4de-1efc0e86ff34')
    await expect(detailsPage.subjectIdSummaryRow).toBeVisible()
    await expect(detailsPage.subjectIdSummaryRow).toContainText('A123456')
    await expect(detailsPage.caseIdSummaryRow).toBeVisible()
    await expect(detailsPage.caseIdSummaryRow).toContainText('caseRef1')
    await expect(detailsPage.queryDateFromSummaryRow).toBeVisible()
    await expect(detailsPage.queryDateFromSummaryRow).toContainText('1 March 2024')
    await expect(detailsPage.queryDateToSummaryRow).toBeVisible()
    await expect(detailsPage.queryDateToSummaryRow).toContainText('12 March 2024')
    await expect(detailsPage.reqBySummaryRow).toBeVisible()
    await expect(detailsPage.reqBySummaryRow).toContainText('user')
    await expect(detailsPage.reqDateTimeSummaryRow).toBeVisible()
    await expect(detailsPage.reqDateTimeSummaryRow).toContainText('12 March 2024 at 13:52:40 UTC')
    await expect(detailsPage.productsSummaryRow).toBeVisible()
    await expect(detailsPage.productsSummaryRow).toContainText('hmpps-activities-management-api')
    await expect(detailsPage.productsSummaryRow).toContainText('keyworker-api')
    await expect(detailsPage.productsSummaryRow).toContainText('hmpps-manage-adjudications-api')
    await expect(detailsPage.statusSummaryRow).toBeVisible()
    await expect(detailsPage.statusSummaryRow).toContainText('Pending')
    await expect(detailsPage.claimDateTimeSummaryRow).toBeVisible()
    await expect(detailsPage.claimDateTimeSummaryRow).toContainText('27 March 2024 at 14:49:08 UTC')
    await expect(detailsPage.claimAttemptsSummaryRow).toBeVisible()
    await expect(detailsPage.claimAttemptsSummaryRow).toContainText('1')
    await expect(detailsPage.lastDownloadedSummaryRow).toBeVisible()
    await expect(detailsPage.lastDownloadedSummaryRow).toContainText('28 March 2024 at 16:33:27 UTC')
    await expect(detailsPage.successPanel).not.toBeVisible()
    await expect(detailsPage.errorSummary).not.toBeVisible()
  })

  test('Displays restart button for errored request only', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })
    await page.goto('/admin/reports')
    const reportsPage = await verifyOnPage(page, AdminReportsPage)
    await reportsPage.followReportsDetailsLink()
    const detailsPage = await verifyOnPage(page, AdminDetailsPage)

    await expect(detailsPage.statusSummaryRow).toContainText('Pending')
    await expect(detailsPage.restartButton).not.toBeVisible()

    await detailsPage.back()
    await reportsPage.followReportsDetailsLink(1)
    await expect(detailsPage.statusSummaryRow).toContainText('Completed')
    await expect(detailsPage.restartButton).not.toBeVisible()

    await detailsPage.back()
    await reportsPage.followReportsDetailsLink(2)
    await expect(detailsPage.statusSummaryRow).toContainText('Errored')
    await expect(detailsPage.restartButton).toBeVisible()
  })

  test('Can restart request successfully', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })
    await sarAdminApi.stubRestartSubjectAccessRequest({
      sarId: 'cccccccc-cb77-4c0e-a4de-1efc0e86ff34',
      httpStatus: 200,
      responseMessage: '',
    })
    await page.goto('/admin/reports')
    const reportsPage = await verifyOnPage(page, AdminReportsPage)
    await reportsPage.followReportsDetailsLink(2)
    const detailsPage = await verifyOnPage(page, AdminDetailsPage)

    await expect(detailsPage.statusSummaryRow).toContainText('Errored')
    await detailsPage.restart()

    const reloadedDetailsPage = await verifyOnPage(page, AdminDetailsPage)
    await expect(reloadedDetailsPage.idSummaryRow).toContainText('cccccccc-cb77-4c0e-a4de-1efc0e86ff34')
    await expect(reloadedDetailsPage.successPanel).toBeVisible()
    await expect(reloadedDetailsPage.errorSummary).not.toBeVisible()
  })

  test('Restart request when error', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })
    await sarAdminApi.stubRestartSubjectAccessRequest({
      sarId: 'cccccccc-cb77-4c0e-a4de-1efc0e86ff34',
      httpStatus: 400,
      responseMessage: 'test error message',
    })
    await page.goto('/admin/reports')
    const reportsPage = await verifyOnPage(page, AdminReportsPage)
    await reportsPage.followReportsDetailsLink(2)
    const detailsPage = await verifyOnPage(page, AdminDetailsPage)

    await expect(detailsPage.statusSummaryRow).toContainText('Errored')
    await detailsPage.restart()

    const reloadedDetailsPage = await verifyOnPage(page, AdminDetailsPage)
    await expect(reloadedDetailsPage.idSummaryRow).toContainText('cccccccc-cb77-4c0e-a4de-1efc0e86ff34')
    await expect(reloadedDetailsPage.successPanel).not.toBeVisible()
    await expect(reloadedDetailsPage.errorSummary).toBeVisible()
    await expect(reloadedDetailsPage.errorSummary).toContainText('test error message')
  })
})
