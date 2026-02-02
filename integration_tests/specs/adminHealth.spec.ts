import { expect, Locator, test } from '@playwright/test'
import hmppsAuth from '../mockApis/hmppsAuth'

import { ADMIN_ROLE, login, REGISTER_TEMPLATE_ROLE, resetStubs, USER_ROLE, verifyOnPage } from '../testUtils'
import AuthSignInPage from '../pages/authSignInPage'
import AuthErrorPage from '../pages/authErrorPage'
import AdminHealthPage from '../pages/adminHealthPage'
import healthApi from '../mockApis/health'

test.describe('Admin Health', () => {
  test.beforeEach(async () => {
    await healthApi.stubGetHealth()
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Redirects to auth if requested by unauthenticated user', async ({ page }) => {
    await hmppsAuth.stubSignInPage()
    await page.goto('/admin/health')

    await verifyOnPage(page, AuthSignInPage)
  })

  const unauthorisedRoles = [USER_ROLE, REGISTER_TEMPLATE_ROLE, 'ROLE_OTHER']
  test.describe('Redirects to authError if requested by user without appropriate role', () => {
    unauthorisedRoles.forEach(role => {
      test(`redirects to authError for role ${role} `, async ({ page }) => {
        await login(page, { roles: [role] })
        await page.goto('/admin/health')

        await verifyOnPage(page, AuthErrorPage)
      })
    })
  })

  test('Renders for authenticated users', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })
    await page.goto('/admin/health')

    await verifyOnPage(page, AdminHealthPage)
  })

  test('Displays document store health', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })
    await page.goto('/admin/health')
    const healthPage = await verifyOnPage(page, AdminHealthPage)

    await expect(healthPage.documentStoreHealthTable).toBeVisible()
    await expectRowStatus(healthPage.documentStoreRow('Document store'), 'UP')
  })

  test('Displays lookup services health', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })
    await page.goto('/admin/health')
    const healthPage = await verifyOnPage(page, AdminHealthPage)

    await expect(healthPage.lookupServicesHealthTable).toBeVisible()
    await expectRowStatus(healthPage.lookupServicesRow('Prison'), 'UP')
    await expectRowStatus(healthPage.lookupServicesRow('External User'), 'UP')
    await expectRowStatus(healthPage.lookupServicesRow('Nomis User'), 'DOWN')
    await expectRowStatus(healthPage.lookupServicesRow('Probation User'), 'UP')
    await expectRowStatus(healthPage.lookupServicesRow('Probation User'), 'UP')
    await expectRowStatus(healthPage.lookupServicesRow('Locations'), 'UP')
    await expectRowStatus(healthPage.lookupServicesRow('Locations Nomis Mappings'), 'UP')
  })

  test('Displays SAR services health', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })
    await page.goto('/admin/health')
    const healthPage = await verifyOnPage(page, AdminHealthPage)

    await expect(healthPage.sarServicesHealthTable).toBeVisible()
    await expectRowStatus(healthPage.sarServicesRow('G1'), 'DOWN')
    await expectRowStatus(healthPage.sarServicesRow('G2'), 'UP')
    await expectRowStatus(healthPage.sarServicesRow('hmpps-book-secure-move-api'), 'UP')
    await expectRowStatus(healthPage.sarServicesRow('hmpps-offender-categorisation-api'), 'DOWN')
    await expectRowStatus(healthPage.sarServicesRow('hmpps-service-three-api'), 'DOWN')
    await expectRowStatus(healthPage.sarServicesRow('hmpps-service-four-api'), 'DOWN')
    await expect(healthPage.sarServicesRow('hmpps-offender-categorisation-api')).toContainText('some error')
    await expect(healthPage.sarServicesRow('hmpps-service-three-api')).toContainText('some error two')
    await expect(healthPage.sarServicesRow('hmpps-service-four-api')).toContainText('some error three')
    await expectTemplateStatus(healthPage.sarServicesRow('hmpps-offender-categorisation-api'), 'HEALTHY', 'UP')
    await expectTemplateStatus(healthPage.sarServicesRow('hmpps-service-three-api'), 'UNHEALTHY', 'DOWN')
    await expectTemplateStatusNoClass(healthPage.sarServicesRow('hmpps-service-four-api'), 'NOT_MIGRATED')
  })

  async function expectRowStatus(row: Locator, status: string) {
    await expect(row).toBeVisible()
    await expect(row).toContainText(status)
    await expect(row.locator('td', { hasText: status })).toContainClass(`health-table__cell_${status}`)
  }

  async function expectTemplateStatus(row: Locator, status: string, cellClass: string) {
    await expect(row).toBeVisible()
    await expect(row).toContainText(status)
    await expect(row.locator('td', { hasText: status })).toContainClass(`health-table__cell_${cellClass}`)
  }

  async function expectTemplateStatusNoClass(row: Locator, status: string) {
    await expect(row).toBeVisible()
    await expect(row).toContainText(status)
    await expect(row.locator('td', { hasText: status })).not.toContainClass('health-table__cell_UP')
    await expect(row.locator('td', { hasText: status })).not.toContainClass('health-table__cell_DOWN')
  }
})
