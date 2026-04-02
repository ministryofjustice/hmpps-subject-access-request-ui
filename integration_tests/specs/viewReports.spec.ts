import { expect, test } from '@playwright/test'
import hmppsAuth from '../mockApis/hmppsAuth'

import { ADMIN_ROLE, login, resetStubs, USER_ROLE, verifyOnPage } from '../testUtils'
import AuthSignInPage from '../pages/authSignInPage'
import AuthErrorPage from '../pages/authErrorPage'
import ReportsPage from '../pages/reportsPage'
import sarApi from '../mockApis/sarApi'
import AdminDetailsPage from '../pages/adminDetailsPage'
import ReportDetailsPage from '../pages/reportDetailsPage'

test.describe('View reports', () => {
  test.beforeEach(async () => {
    await sarApi.stubGetSubjectAccessRequests({})
    await sarApi.stubGetTotalSubjectAccessRequests()
    await sarApi.stubGetSubjectAccessRequest({})
    await sarApi.stubGetProductsSuspended(200, [])
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Redirects to auth if requested by unauthenticated user', async ({ page }) => {
    await hmppsAuth.stubSignInPage()
    await page.goto('/reports')

    await verifyOnPage(page, AuthSignInPage)
  })

  test('Redirects to authError if requested by user without appropriate role', async ({ page }) => {
    await login(page, { roles: ['ROLE_OTHER'] })
    await page.goto('/reports')

    await verifyOnPage(page, AuthErrorPage)
  })

  test('Renders for authenticated users', async ({ page }) => {
    await login(page, { roles: [USER_ROLE] })
    await page.goto('/reports')

    await verifyOnPage(page, ReportsPage)
  })

  test('Displays table of reports', async ({ page }) => {
    await login(page, { roles: [USER_ROLE] })
    await page.goto('/reports')
    const reportsPage = await verifyOnPage(page, ReportsPage)

    await expect(reportsPage.reportsTable).toBeVisible()
    await expect(reportsPage.reportsTable).toContainText('Date of request')
    await expect(reportsPage.reportsTable).toContainText('Case Reference')
    await expect(reportsPage.reportsTable).toContainText('Subject ID')
    await expect(reportsPage.reportsTable).toContainText('Status')
  })

  test('Displays search box for filtering', async ({ page }) => {
    await login(page, { roles: [USER_ROLE] })
    await page.goto('/reports')
    const reportsPage = await verifyOnPage(page, ReportsPage)

    await expect(reportsPage.searchBox).toBeVisible()
  })

  test('Can be sorted on date of request', async ({ page }) => {
    await login(page, { roles: [USER_ROLE] })
    await page.goto('/reports')
    const reportsPage = await verifyOnPage(page, ReportsPage)

    await expect(reportsPage.reportsTableRow(0)).toContainText('07/03/2025 13:52')
    await reportsPage.sortByDate()
    await expect(reportsPage.reportsTableRow(0)).toContainText('07/03/2022 12:53')
  })

  test('Can search for reports', async ({ page }) => {
    await login(page, { roles: [USER_ROLE] })
    await page.goto('/reports')
    const reportsPage = await verifyOnPage(page, ReportsPage)
    await reportsPage.searchFor('caseRef2')

    expect(reportsPage.page.url()).toMatch(/reports\?keyword=caseRef2/)
    const searchRequests = await sarApi.getSubjectAccessRequestsWithSearchValue('caseRef2')
    expect(searchRequests).toHaveLength(1)
  })

  test('Can navigate to report details', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })
    await page.goto('/reports')
    const reportsPage = await verifyOnPage(page, ReportsPage)
    await reportsPage.followReportDetailsLink()

    await verifyOnPage(page, AdminDetailsPage)
  })

  test('Displays report details', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })
    await page.goto('/reports')
    const reportsPage = await verifyOnPage(page, ReportsPage)
    await reportsPage.followReportDetailsLink()
    const detailsPage = await verifyOnPage(page, ReportDetailsPage)

    await expect(detailsPage.suspendedProductsAlert).not.toBeVisible()
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
    await expect(detailsPage.reqDateTimeSummaryRow).toContainText('7 March 2025 at 13:52:40 UTC')
    await expect(detailsPage.statusSummaryRow).toBeVisible()
    await expect(detailsPage.statusSummaryRow).toContainText('Pending')
    await expect(detailsPage.lastDownloadedSummaryRow).toBeVisible()
    await expect(detailsPage.lastDownloadedSummaryRow).toContainText('28 March 2024 at 16:33:27 UTC')

    await expect(detailsPage.productsSummaryRow).toBeVisible()
    await expect(detailsPage.selectedProductItem(0)).toContainText('Adjudications')
    await expect(detailsPage.selectedProductItemStatus(0)).toContainText('COMPLETE')
    await expect(detailsPage.selectedProductItemStatus(0)).toContainClass('moj-badge--green')
    await expect(detailsPage.selectedProductItem(1)).toContainText('Allocate Keyworkers and Personal Officers')
    await expect(detailsPage.selectedProductItemStatus(1)).toContainText('ERRORED')
    await expect(detailsPage.selectedProductItemStatus(1)).toContainClass('moj-badge--red')
    await expect(detailsPage.selectedProductItem(2)).toContainText('Manage activities and appointments')
    await expect(detailsPage.selectedProductItemStatus(2)).toContainText('PENDING')
    await expect(detailsPage.selectedProductItemStatus(2)).toContainClass('moj-badge--grey')
  })

  test('Displays report details when suspended products', async ({ page }) => {
    await sarApi.stubGetProductsSuspended()
    await login(page, { roles: [ADMIN_ROLE] })
    await page.goto('/reports')
    const reportsPage = await verifyOnPage(page, ReportsPage)
    await reportsPage.followReportDetailsLink()
    const detailsPage = await verifyOnPage(page, ReportDetailsPage)

    await expect(detailsPage.suspendedProductsAlert).toBeVisible()
    await expect(detailsPage.suspendedProductsAlert).toContainText('Product Suspended')
    await expect(detailsPage.suspendedProductsAlertList).toBeVisible()
    await expect(detailsPage.suspendedProductsAlertList.locator('li')).toHaveCount(1)
    await expect(detailsPage.suspendedProductsAlertList).toContainText('Service Ninety Nine')

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
    await expect(detailsPage.reqDateTimeSummaryRow).toContainText('7 March 2025 at 13:52:40 UTC')
    await expect(detailsPage.statusSummaryRow).toBeVisible()
    await expect(detailsPage.statusSummaryRow).toContainText('Pending')
    await expect(detailsPage.lastDownloadedSummaryRow).toBeVisible()
    await expect(detailsPage.lastDownloadedSummaryRow).toContainText('28 March 2024 at 16:33:27 UTC')

    await expect(detailsPage.productsSummaryRow).toBeVisible()
    await expect(detailsPage.selectedProductItem(0)).toContainText('Adjudications')
    await expect(detailsPage.selectedProductItemStatus(0)).toContainText('COMPLETE')
    await expect(detailsPage.selectedProductItemStatus(0)).toContainClass('moj-badge--green')
    await expect(detailsPage.selectedProductItem(1)).toContainText('Allocate Keyworkers and Personal Officers')
    await expect(detailsPage.selectedProductItemStatus(1)).toContainText('ERRORED')
    await expect(detailsPage.selectedProductItemStatus(1)).toContainClass('moj-badge--red')
    await expect(detailsPage.selectedProductItem(2)).toContainText('Manage activities and appointments')
    await expect(detailsPage.selectedProductItemStatus(2)).toContainText('PENDING')
    await expect(detailsPage.selectedProductItemStatus(2)).toContainClass('moj-badge--grey')
  })

  test('Redirects to view reports when click back on report details', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })
    await page.goto('/reports')
    let reportsPage = await verifyOnPage(page, ReportsPage)
    await reportsPage.followReportDetailsLink()
    const detailsPage = await verifyOnPage(page, ReportDetailsPage)

    await detailsPage.back()
    await verifyOnPage(page, ReportsPage)
    reportsPage = await verifyOnPage(page, ReportsPage)
    expect(reportsPage.page.url()).toMatch(/reports\?$/)
  })
})
