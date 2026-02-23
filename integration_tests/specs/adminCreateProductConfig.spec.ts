import { expect, test } from '@playwright/test'
import hmppsAuth from '../mockApis/hmppsAuth'

import {
  ADMIN_ROLE,
  login,
  productConfigExpectAllInputsFilled,
  productConfigExpectAllInputsToBeEmpty,
  productConfigInputAllValues,
  REGISTER_TEMPLATE_ROLE,
  resetStubs,
  USER_ROLE,
  verifyOnPage,
} from '../testUtils'
import AuthSignInPage from '../pages/authSignInPage'
import AuthErrorPage from '../pages/authErrorPage'
import sarApi from '../mockApis/sarApi'
import AdminCreateProductConfigPage from '../pages/adminCreateProductConfigPage'
import AdminProductConfigPage from '../pages/adminProductConfigPage'

test.describe('Admin Create Product Configuration', () => {
  test.beforeEach(async () => {
    await sarApi.stubGetProducts()
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Redirects to auth if requested by unauthenticated user', async ({ page }) => {
    await hmppsAuth.stubSignInPage()
    await page.goto('/admin/create-product-config')

    await verifyOnPage(page, AuthSignInPage)
  })

  const unauthorisedRoles = [USER_ROLE, REGISTER_TEMPLATE_ROLE, 'ROLE_OTHER']
  test.describe('Redirects to authError if requested by user without appropriate role', () => {
    unauthorisedRoles.forEach(role => {
      test(`redirects to authError for role ${role} `, async ({ page }) => {
        await login(page, { roles: [role] })
        await page.goto('/admin/create-product-config')

        await verifyOnPage(page, AuthErrorPage)
      })
    })
  })

  test('Renders for authenticated users', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })
    await page.goto('/admin/create-product-config')
    const createPage = await verifyOnPage(page, AdminCreateProductConfigPage)

    await expect(createPage.nameTextbox).toBeVisible()
    await expect(createPage.labelTextbox).toBeVisible()
    await expect(createPage.urlTextbox).toBeVisible()
    await expect(createPage.prisonCategoryRadio).toBeVisible()
    await expect(createPage.probationCategoryRadio).toBeVisible()
    await expect(createPage.enabledCheckbox).toBeVisible()
    await expect(createPage.migratedCheckbox).toBeVisible()
    await expect(createPage.continueButton).toBeVisible()
    await expect(createPage.errorSummary).not.toBeVisible()
    await productConfigExpectAllInputsToBeEmpty(createPage)
  })

  test('Submits product config details and redirects to /admin/confirm-create-product-config', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })
    await page.goto('/admin/create-product-config')
    const createPage = await verifyOnPage(page, AdminCreateProductConfigPage)

    await productConfigInputAllValues(createPage)
    const [request] = await Promise.all([
      page.waitForRequest(req => req.method() === 'POST' && req.url().includes('/admin/create-product-config')),
      await createPage.continue(),
    ])
    const requestBody = request.postData()

    expect(requestBody).toContain('name=service-one')
    expect(requestBody).toContain('label=My+Service+One')
    expect(requestBody).toContain('url=https%3A%2F%2Fmy-service-one')
    expect(requestBody).toContain('category=PRISON')
    expect(requestBody).toContain('enabled=enabled')
    expect(requestBody).toContain('templateMigrated=templateMigrated')
    expect(createPage.page.url()).toMatch(/admin\/confirm-create-product-config$/)
  })

  test('Persists product config details when returning to create product config page', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })
    await page.goto('/admin/create-product-config')
    let createPage = await verifyOnPage(page, AdminCreateProductConfigPage)

    await productConfigInputAllValues(createPage)
    await createPage.continue()

    await page.goto('/admin/create-product-config')

    createPage = await verifyOnPage(page, AdminCreateProductConfigPage)
    await productConfigExpectAllInputsFilled(createPage)
  })

  test('Persists product config details without checkboxes checked when returning to create product config page', async ({
    page,
  }) => {
    await login(page, { roles: [ADMIN_ROLE] })
    await page.goto('/admin/create-product-config')
    let createPage = await verifyOnPage(page, AdminCreateProductConfigPage)

    await createPage.inputName('service-one')
    await createPage.inputLabel('My Service One')
    await createPage.inputUrl('https://my-service-one')
    await createPage.prisonCategoryRadio.check()
    await createPage.continue()

    await page.goto('/admin/create-product-config')

    createPage = await verifyOnPage(page, AdminCreateProductConfigPage)
    await expect(createPage.nameTextbox).toHaveValue('service-one')
    await expect(createPage.labelTextbox).toHaveValue('My Service One')
    await expect(createPage.urlTextbox).toHaveValue('https://my-service-one')
    await expect(createPage.prisonCategoryRadio).toBeChecked()
    await expect(createPage.probationCategoryRadio).not.toBeChecked()
    await expect(createPage.enabledCheckbox).not.toBeChecked()
    await expect(createPage.migratedCheckbox).not.toBeChecked()
  })

  test('Does not allow empty name, label, url and category input', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })
    await page.goto('/admin/create-product-config')
    let createPage = await verifyOnPage(page, AdminCreateProductConfigPage)

    await createPage.continue()

    createPage = await verifyOnPage(page, AdminCreateProductConfigPage)
    await productConfigExpectAllInputsToBeEmpty(createPage)
    await expect(createPage.errorSummary).toBeVisible()
    await expect(createPage.errorSummary).toContainText('name must be provided')
    await expect(createPage.errorSummary).toContainText('label must be provided')
    await expect(createPage.errorSummary).toContainText('url must be provided')
    await expect(createPage.errorSummary).toContainText('category must be provided')
  })

  test('Redirects to product config page when back link is clicked', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })
    await page.goto('/admin/create-product-config')
    const createPage = await verifyOnPage(page, AdminCreateProductConfigPage)

    await createPage.back()

    const productConfigPage = await verifyOnPage(page, AdminProductConfigPage)
    expect(productConfigPage.page.url()).toMatch(/admin\/product-config$/)
  })

  test('Inputs are cleared when back link is clicked and go to create product config again', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })
    await page.goto('/admin/create-product-config')
    let createPage = await verifyOnPage(page, AdminCreateProductConfigPage)
    await productConfigInputAllValues(createPage)
    await createPage.back()
    const productConfigPage = await verifyOnPage(page, AdminProductConfigPage)
    await productConfigPage.createProductConfig()
    createPage = await verifyOnPage(page, AdminCreateProductConfigPage)

    await productConfigExpectAllInputsToBeEmpty(createPage)
  })
})
