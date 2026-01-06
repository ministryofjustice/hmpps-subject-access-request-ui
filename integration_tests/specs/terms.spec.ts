import { expect, test } from '@playwright/test'
import hmppsAuth from '../mockApis/hmppsAuth'

import { login, resetStubs, USER_ROLE, verifyOnPage } from '../testUtils'
import AuthSignInPage from '../pages/authSignInPage'
import AuthErrorPage from '../pages/authErrorPage'
import TermsPage from '../pages/termsPage'
import HomePage from '../pages/homePage'

test.describe('View reports', () => {
  test.afterEach(async () => {
    await resetStubs()
  })

  test('Redirects to auth if requested by unauthenticated user', async ({ page }) => {
    await hmppsAuth.stubSignInPage()
    await page.goto('/terms')

    await verifyOnPage(page, AuthSignInPage)
  })

  test('Redirects to authError if requested by user without appropriate role', async ({ page }) => {
    await login(page, { roles: ['ROLE_OTHER'] })
    await page.goto('/terms')

    await verifyOnPage(page, AuthErrorPage)
  })

  test('Renders for authenticated users', async ({ page }) => {
    await login(page, { roles: [USER_ROLE] })
    await page.goto('/terms')

    await verifyOnPage(page, TermsPage)
  })

  test('Displays all necessary components', async ({ page }) => {
    await login(page, { roles: [USER_ROLE] })
    await page.goto('/terms')
    const termsAndConditionsPage = await verifyOnPage(page, TermsPage)

    await expect(termsAndConditionsPage.termsAndConditions).toBeVisible()
    await expect(termsAndConditionsPage.linkToHomepage).toBeVisible()
  })

  test('redirects to homepage when back link is clicked', async ({ page }) => {
    await login(page, { roles: [USER_ROLE] })
    await page.goto('/terms')
    const termsAndConditionsPage = await verifyOnPage(page, TermsPage)
    await termsAndConditionsPage.home()

    await verifyOnPage(page, HomePage)
  })
})
