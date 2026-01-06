import { expect, test } from '@playwright/test'
import hmppsAuth from '../mockApis/hmppsAuth'

import { login, resetStubs, USER_ROLE, verifyOnPage } from '../testUtils'
import AuthSignInPage from '../pages/authSignInPage'
import AuthErrorPage from '../pages/authErrorPage'
import RequestReportConfirmationPage from '../pages/requestReportConfirmationPage'

test.describe('Request Report - Confirmation', () => {
  test.beforeEach(async () => {})

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Redirects to auth if requested by unauthenticated user', async ({ page }) => {
    await hmppsAuth.stubSignInPage()
    await page.goto('/confirmation')

    await verifyOnPage(page, AuthSignInPage)
  })

  test('Redirects to authError if requested by user without appropriate role', async ({ page }) => {
    await login(page, { roles: ['ROLE_OTHER'] })
    await page.goto('/confirmation')

    await verifyOnPage(page, AuthErrorPage)
  })

  test('Renders for authenticated users', async ({ page }) => {
    await login(page, { roles: [USER_ROLE] })
    await page.goto('/confirmation')

    await verifyOnPage(page, RequestReportConfirmationPage)
  })

  test('Displays confirmation panel', async ({ page }) => {
    await login(page, { roles: [USER_ROLE] })
    await page.goto('/confirmation')
    const confirmationPage = await verifyOnPage(page, RequestReportConfirmationPage)

    await expect(confirmationPage.confirmationPanel).toBeVisible()
  })

  test('Displays next steps', async ({ page }) => {
    await login(page, { roles: [USER_ROLE] })
    await page.goto('/confirmation')
    const confirmationPage = await verifyOnPage(page, RequestReportConfirmationPage)

    await expect(confirmationPage.nextSteps).toBeVisible()
    await expect(confirmationPage.nextSteps).toContainText(
      'You can check on the progress of this report and view it after completion on the reports page.',
    )
  })

  test('Redirects to /reports on clicking view reports link', async ({ page }) => {
    await login(page, { roles: [USER_ROLE] })
    await page.goto('/confirmation')
    const confirmationPage = await verifyOnPage(page, RequestReportConfirmationPage)

    await confirmationPage.viewReports()
    expect(confirmationPage.page.url()).toMatch(/reports$/)
  })
})
