import { expect, test } from '@playwright/test'
import hmppsAuth from '../mockApis/hmppsAuth'
import sarApi from '../mockApis/sarApi'
import { ADMIN_ROLE, login, registerTemplateConfirmation, resetStubs, USER_ROLE, verifyOnPage } from '../testUtils'
import AuthSignInPage from '../pages/authSignInPage'
import AuthErrorPage from '../pages/authErrorPage'
import RegisterTemplateConfirmationPage from '../pages/registerTemplateConfirmationPage'

test.describe('Register template confirmation', () => {
  test.beforeEach(async () => {
    await sarApi.stubGetProducts()
    await sarApi.stubGetTemplateVersions({})
    await sarApi.stubUploadTemplateFile({})
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Redirects to auth if requested by unauthenticated user', async ({ page }) => {
    await hmppsAuth.stubSignInPage()
    await page.goto('/register-template/confirmation')

    await verifyOnPage(page, AuthSignInPage)
  })

  const unauthorisedRoles = [USER_ROLE, ADMIN_ROLE, 'ROLE_OTHER']
  test.describe('Redirects to authError if requested by user without appropriate role', () => {
    unauthorisedRoles.forEach(role => {
      test(`redirects to authError for role ${role} `, async ({ page }) => {
        await login(page, { roles: [role] })
        await page.goto('/register-template/confirmation')

        await verifyOnPage(page, AuthErrorPage)
      })
    })
  })

  test('Renders for authenticated users', async ({ page }) => {
    await registerTemplateConfirmation(page, {})
    const confirmationPage = await verifyOnPage(page, RegisterTemplateConfirmationPage)

    await expect(confirmationPage.productParagraph).toContainText('Service One')
    await expect(confirmationPage.filenameParagraph).toContainText('template.mustache')
  })

  test('Redirects to result when confirm', async ({ page }) => {
    await registerTemplateConfirmation(page, {})
    const confirmationPage = await verifyOnPage(page, RegisterTemplateConfirmationPage)

    await confirmationPage.confirm()

    expect(confirmationPage.page.url()).toMatch(/register-template\/result$/)
  })

  test('Redirects to upload when cancel', async ({ page }) => {
    await registerTemplateConfirmation(page, {})
    const confirmationPage = await verifyOnPage(page, RegisterTemplateConfirmationPage)

    await confirmationPage.cancel()

    expect(confirmationPage.page.url()).toMatch(/register-template\/upload/)
  })
})
