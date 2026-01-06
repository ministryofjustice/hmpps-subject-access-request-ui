import { expect, test } from '@playwright/test'
import hmppsAuth from '../mockApis/hmppsAuth'
import sarApi from '../mockApis/sarApi'
import { ADMIN_ROLE, login, REGISTER_TEMPLATE_ROLE, resetStubs, USER_ROLE, verifyOnPage } from '../testUtils'
import AuthSignInPage from '../pages/authSignInPage'
import AuthErrorPage from '../pages/authErrorPage'
import RegisterTemplateProductPage from '../pages/registerTemplateProductPage'
import HomePage from '../pages/homePage'

test.describe('Register template select product', () => {
  test.beforeEach(async () => {
    await sarApi.stubGetProducts()
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Redirects to auth if requested by unauthenticated user', async ({ page }) => {
    await hmppsAuth.stubSignInPage()
    await page.goto('/register-template/select-product')

    await verifyOnPage(page, AuthSignInPage)
  })

  const unauthorisedRoles = [USER_ROLE, ADMIN_ROLE, 'ROLE_OTHER']
  test.describe('Redirects to authError if requested by user without appropriate role', () => {
    unauthorisedRoles.forEach(role => {
      test(`redirects to authError for role ${role} `, async ({ page }) => {
        await login(page, { roles: [role] })
        await page.goto('/register-template/select-product')

        await verifyOnPage(page, AuthErrorPage)
      })
    })
  })

  test('Renders for authenticated users', async ({ page }) => {
    await login(page, { roles: [REGISTER_TEMPLATE_ROLE] })
    await page.goto('/register-template/select-product')

    const selectProductPage = await verifyOnPage(page, RegisterTemplateProductPage)

    await expect(selectProductPage.errorSummary).not.toBeVisible()
  })

  test('Displays error when no products found', async ({ page }) => {
    await login(page, { roles: [REGISTER_TEMPLATE_ROLE] })
    await sarApi.stubGetProducts(200, [])
    await page.goto('/register-template/select-product')

    const selectProductPage = await verifyOnPage(page, RegisterTemplateProductPage)

    await expect(selectProductPage.errorSummary).toContainText('No products found. A template cannot be registered.')
    await expect(selectProductPage.productInputError).toContainText(
      'No products found. A template cannot be registered.',
    )
  })

  test('Displays error when continue without selecting product', async ({ page }) => {
    await login(page, { roles: [REGISTER_TEMPLATE_ROLE] })
    await page.goto('/register-template/select-product')
    const selectProductPage = await verifyOnPage(page, RegisterTemplateProductPage)

    await selectProductPage.continue()

    await expect(selectProductPage.errorSummary).toContainText('A product must be selected')
    await expect(selectProductPage.productInputError).toContainText('A product must be selected')
  })

  test('Redirects to upload when continue with product selected', async ({ page }) => {
    await login(page, { roles: [REGISTER_TEMPLATE_ROLE] })
    await page.goto('/register-template/select-product')
    const selectProductPage = await verifyOnPage(page, RegisterTemplateProductPage)

    await selectProductPage.selectProduct('1')
    await selectProductPage.continue()

    await expect(selectProductPage.errorSummary).not.toBeVisible()
    expect(selectProductPage.page.url()).toMatch(/register-template\/upload$/)
  })

  test('Redirects to homepage when back link clicked', async ({ page }) => {
    await login(page, { roles: [REGISTER_TEMPLATE_ROLE] })
    await page.goto('/register-template/select-product')
    const selectProductPage = await verifyOnPage(page, RegisterTemplateProductPage)

    await selectProductPage.back()

    await verifyOnPage(page, HomePage)
  })
})
