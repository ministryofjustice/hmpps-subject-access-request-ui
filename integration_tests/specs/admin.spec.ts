import { expect, test } from '@playwright/test'
import hmppsAuth from '../mockApis/hmppsAuth'

import { ADMIN_ROLE, login, REGISTER_TEMPLATE_ROLE, resetStubs, USER_ROLE, verifyOnPage } from '../testUtils'
import AuthSignInPage from '../pages/authSignInPage'
import AuthErrorPage from '../pages/authErrorPage'
import AdminPage from '../pages/adminPage'
import AdminHealthPage from '../pages/adminHealthPage'
import AdminReportsPage from '../pages/adminReportsPage'
import healthApi from '../mockApis/health'
import sarAdminApi from '../mockApis/sarAdmin'
import sarApi from '../mockApis/sarApi'
import AdminProductConfigPage from '../pages/adminProductConfigPage'

test.describe('Admin', () => {
  test.beforeEach(async () => {
    await healthApi.stubGetHealth()
    await sarAdminApi.stubGetSubjectAccessRequestAdminSummary()
    await sarApi.stubGetProducts()
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Redirects to auth if requested by unauthenticated user', async ({ page }) => {
    await hmppsAuth.stubSignInPage()
    await page.goto('/admin')

    await verifyOnPage(page, AuthSignInPage)
  })

  const unauthorisedRoles = [USER_ROLE, REGISTER_TEMPLATE_ROLE, 'ROLE_OTHER']
  test.describe('Redirects to authError if requested by user without appropriate role', () => {
    unauthorisedRoles.forEach(role => {
      test(`redirects to authError for role ${role} `, async ({ page }) => {
        await login(page, { roles: [role] })
        await page.goto('/admin')

        await verifyOnPage(page, AuthErrorPage)
      })
    })
  })

  test('Renders for authenticated users', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })
    await page.goto('/admin')

    await verifyOnPage(page, AdminPage)
  })

  test('Can navigate to health', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })
    await page.goto('/admin')
    const adminPage = await verifyOnPage(page, AdminPage)
    await expect(adminPage.healthLink).toBeVisible()
    await adminPage.clickHealthLink()

    await verifyOnPage(page, AdminHealthPage)
  })

  test('Can navigate to reports admin', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })
    await page.goto('/admin')
    const adminPage = await verifyOnPage(page, AdminPage)
    await expect(adminPage.reportsLink).toBeVisible()
    await adminPage.clickReportsLink()

    await verifyOnPage(page, AdminReportsPage)
  })

  test('Can navigate to product configuration', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })
    await page.goto('/admin')
    const adminPage = await verifyOnPage(page, AdminPage)
    await expect(adminPage.productConfigLink).toBeVisible()
    await adminPage.clickProductConfigLink()

    await verifyOnPage(page, AdminProductConfigPage)
  })
})
