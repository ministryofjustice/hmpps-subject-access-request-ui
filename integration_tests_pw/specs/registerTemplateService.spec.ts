import { expect, test } from '@playwright/test'
import hmppsAuth from '../mockApis/hmppsAuth'
import sarApi from '../mockApis/sarApi'
import { ADMIN_ROLE, login, REGISTER_TEMPLATE_ROLE, resetStubs, USER_ROLE, verifyOnPage } from '../testUtils'
import AuthSignInPage from '../pages/authSignInPage'
import AuthErrorPage from '../pages/authErrorPage'
import RegisterTemplateServicePage from '../pages/registerTemplateServicePage'
import HomePage from '../pages/homePage'

test.describe('Register template select service', () => {
  test.beforeEach(async () => {
    await sarApi.stubGetServices()
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Redirects to auth if requested by unauthenticated user', async ({ page }) => {
    await hmppsAuth.stubSignInPage()
    await page.goto('/register-template/select-service')

    await verifyOnPage(page, AuthSignInPage)
  })

  const unauthorisedRoles = [USER_ROLE, ADMIN_ROLE, 'ROLE_OTHER']
  test.describe('Redirects to authError if requested by user without appropriate role', () => {
    unauthorisedRoles.forEach(role => {
      test(`redirects to authError for role ${role} `, async ({ page }) => {
        await login(page, { roles: [role] })
        await page.goto('/register-template/select-service')

        await verifyOnPage(page, AuthErrorPage)
      })
    })
  })

  test('Renders for authenticated users', async ({ page }) => {
    await login(page, { roles: [REGISTER_TEMPLATE_ROLE] })
    await page.goto('/register-template/select-service')

    const selectServicePage = await verifyOnPage(page, RegisterTemplateServicePage)

    await expect(selectServicePage.errorSummary).not.toBeVisible()
  })

  test('Displays error when no services found', async ({ page }) => {
    await login(page, { roles: [REGISTER_TEMPLATE_ROLE] })
    await sarApi.stubGetServices(200, [])
    await page.goto('/register-template/select-service')

    const selectServicePage = await verifyOnPage(page, RegisterTemplateServicePage)

    await expect(selectServicePage.errorSummary).toContainText('No services found. A template cannot be registered.')
    await expect(selectServicePage.serviceInputError).toContainText(
      'No services found. A template cannot be registered.',
    )
  })

  test('Displays error when continue without selecting service', async ({ page }) => {
    await login(page, { roles: [REGISTER_TEMPLATE_ROLE] })
    await page.goto('/register-template/select-service')
    const selectServicePage = await verifyOnPage(page, RegisterTemplateServicePage)

    await selectServicePage.continue()

    await expect(selectServicePage.errorSummary).toContainText('A service must be selected')
    await expect(selectServicePage.serviceInputError).toContainText('A service must be selected')
  })

  test('Redirects to upload when continue with service selected', async ({ page }) => {
    await login(page, { roles: [REGISTER_TEMPLATE_ROLE] })
    await page.goto('/register-template/select-service')
    const selectServicePage = await verifyOnPage(page, RegisterTemplateServicePage)

    await selectServicePage.selectService('1')
    await selectServicePage.continue()

    await expect(selectServicePage.errorSummary).not.toBeVisible()
    expect(selectServicePage.page.url()).toMatch(/register-template\/upload$/)
  })

  test('Redirects to homepage when back link clicked', async ({ page }) => {
    await login(page, { roles: [REGISTER_TEMPLATE_ROLE] })
    await page.goto('/register-template/select-service')
    const selectServicePage = await verifyOnPage(page, RegisterTemplateServicePage)

    await selectServicePage.back()

    await verifyOnPage(page, HomePage)
  })
})
