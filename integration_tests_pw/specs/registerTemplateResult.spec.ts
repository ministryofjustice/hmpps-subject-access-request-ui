import { expect, test } from '@playwright/test'
import hmppsAuth from '../mockApis/hmppsAuth'
import sarApi from '../mockApis/sarApi'
import { ADMIN_ROLE, login, registerTemplateResult, resetStubs, USER_ROLE, verifyOnPage } from '../testUtils'
import AuthSignInPage from '../pages/authSignInPage'
import AuthErrorPage from '../pages/authErrorPage'
import RegisterTemplateResultPage from '../pages/registerTemplateResultPage'
import HomePage from '../pages/homePage'

test.describe('Register template result', () => {
  test.beforeEach(async () => {
    await sarApi.stubGetServices()
    await sarApi.stubGetTemplateVersions({})
    await sarApi.stubUploadTemplateFile({})
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Redirects to auth if requested by unauthenticated user', async ({ page }) => {
    await hmppsAuth.stubSignInPage()
    await page.goto('/register-template/result')

    await verifyOnPage(page, AuthSignInPage)
  })

  const unauthorisedRoles = [USER_ROLE, ADMIN_ROLE, 'ROLE_OTHER']
  test.describe('Redirects to authError if requested by user without appropriate role', () => {
    unauthorisedRoles.forEach(role => {
      test(`redirects to authError for role ${role} `, async ({ page }) => {
        await login(page, { roles: [role] })
        await page.goto('/register-template/result')

        await verifyOnPage(page, AuthErrorPage)
      })
    })
  })

  test('Renders for authenticated users', async ({ page }) => {
    await registerTemplateResult(page, {})
    const templateResultPage = await verifyOnPage(page, RegisterTemplateResultPage)

    await expect(templateResultPage.header).toHaveText('New template version for Service One successfully registered')
    await expect(templateResultPage.serviceSummary).toContainText('Service One')
    await expect(templateResultPage.versionSummary).toContainText('2')
    await expect(templateResultPage.filehashSummary).toContainText('456def')
    await expect(templateResultPage.statusSummary).toContainText('PENDING')
  })

  test('Redirects to homepage when continue', async ({ page }) => {
    await registerTemplateResult(page, {})
    const templateResultPage = await verifyOnPage(page, RegisterTemplateResultPage)

    await templateResultPage.continue()

    await verifyOnPage(page, HomePage)
  })
})
