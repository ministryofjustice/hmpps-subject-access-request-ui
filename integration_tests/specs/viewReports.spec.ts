import { expect, test } from '@playwright/test'
import hmppsAuth from '../mockApis/hmppsAuth'

import { login, resetStubs, USER_ROLE, verifyOnPage } from '../testUtils'
import AuthSignInPage from '../pages/authSignInPage'
import AuthErrorPage from '../pages/authErrorPage'
import ReportsPage from '../pages/reportsPage'
import sarApi from '../mockApis/sarApi'

test.describe('View reports', () => {
  test.beforeEach(async () => {
    await sarApi.stubGetSubjectAccessRequests({})
    await sarApi.stubGetTotalSubjectAccessRequests()
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
})
