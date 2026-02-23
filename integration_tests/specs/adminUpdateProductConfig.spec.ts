import { expect, test } from '@playwright/test'
import hmppsAuth from '../mockApis/hmppsAuth'

import {
  ADMIN_ROLE,
  adminUpdateProductConfig,
  login,
  productConfigClearAllValues,
  productConfigExpectAllInputsFilledDifferent,
  productConfigInputDifferentValues,
  REGISTER_TEMPLATE_ROLE,
  resetStubs,
  USER_ROLE,
  verifyOnPage,
} from '../testUtils'
import AuthSignInPage from '../pages/authSignInPage'
import AuthErrorPage from '../pages/authErrorPage'
import sarApi from '../mockApis/sarApi'
import AdminUpdateProductConfigPage from '../pages/adminUpdateProductConfigPage'
import AdminProductConfigDetailsPage from '../pages/adminProductConfigDetailsPage'

test.describe('Admin Update Product Configuration', () => {
  test.beforeEach(async () => {
    await sarApi.stubGetProducts()
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Redirects to auth if requested by unauthenticated user', async ({ page }) => {
    await hmppsAuth.stubSignInPage()
    await page.goto('/admin/update-product-config')

    await verifyOnPage(page, AuthSignInPage)
  })

  const unauthorisedRoles = [USER_ROLE, REGISTER_TEMPLATE_ROLE, 'ROLE_OTHER']
  test.describe('Redirects to authError if requested by user without appropriate role', () => {
    unauthorisedRoles.forEach(role => {
      test(`redirects to authError for role ${role} `, async ({ page }) => {
        await login(page, { roles: [role] })
        await page.goto('/admin/update-product-config')

        await verifyOnPage(page, AuthErrorPage)
      })
    })
  })

  test('Renders for authenticated users', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })
    await page.goto('/admin/update-product-config')
    const updatePage = await verifyOnPage(page, AdminUpdateProductConfigPage)

    await expect(updatePage.nameTextbox).toBeVisible()
    await expect(updatePage.labelTextbox).toBeVisible()
    await expect(updatePage.urlTextbox).toBeVisible()
    await expect(updatePage.prisonCategoryRadio).toBeVisible()
    await expect(updatePage.probationCategoryRadio).toBeVisible()
    await expect(updatePage.enabledCheckbox).toBeVisible()
    await expect(updatePage.migratedCheckbox).toBeVisible()
    await expect(updatePage.continueButton).toBeVisible()
    await expect(updatePage.errorSummary).not.toBeVisible()
  })

  test('Displays values from selected product config', async ({ page }) => {
    const updatePage = await adminUpdateProductConfig(page)

    await expect(updatePage.nameTextbox).toHaveValue('service-one')
    await expect(updatePage.labelTextbox).toHaveValue('Service One')
    await expect(updatePage.urlTextbox).toHaveValue('http://service-one')
    await expect(updatePage.prisonCategoryRadio).toBeChecked()
    await expect(updatePage.probationCategoryRadio).not.toBeChecked()
    await expect(updatePage.enabledCheckbox).toBeChecked()
    await expect(updatePage.migratedCheckbox).toBeChecked()
  })

  test('Submits product config details and redirects to /admin/confirm-update-product-config', async ({ page }) => {
    const updatePage = await adminUpdateProductConfig(page)
    await productConfigInputDifferentValues(updatePage)

    const [request] = await Promise.all([
      page.waitForRequest(req => req.method() === 'POST' && req.url().includes('/admin/update-product-config')),
      await updatePage.continue(),
    ])
    const requestBody = request.postData()

    expect(requestBody).toContain('name=service-two')
    expect(requestBody).toContain('label=My+Service+Two')
    expect(requestBody).toContain('url=https%3A%2F%2Fmy-service-two')
    expect(requestBody).toContain('category=PROBATION')
    expect(requestBody).not.toContain('enabled=')
    expect(requestBody).not.toContain('templateMigrated=')
    expect(updatePage.page.url()).toMatch(/admin\/confirm-update-product-config$/)
  })

  test('Persists product config details when returning to update product config page', async ({ page }) => {
    let updatePage = await adminUpdateProductConfig(page)
    await productConfigInputDifferentValues(updatePage)
    await updatePage.continue()

    await page.goto('/admin/update-product-config')

    updatePage = await verifyOnPage(page, AdminUpdateProductConfigPage)
    await productConfigExpectAllInputsFilledDifferent(updatePage)
  })

  test('Does not allow empty name, label and url input', async ({ page }) => {
    let updatePage = await adminUpdateProductConfig(page)
    await productConfigClearAllValues(updatePage)
    await updatePage.continue()

    updatePage = await verifyOnPage(page, AdminUpdateProductConfigPage)
    await expect(updatePage.nameTextbox).toHaveValue('')
    await expect(updatePage.labelTextbox).toHaveValue('')
    await expect(updatePage.urlTextbox).toHaveValue('')
    await expect(updatePage.errorSummary).toBeVisible()
    await expect(updatePage.errorSummary).toContainText('name must be provided')
    await expect(updatePage.errorSummary).toContainText('label must be provided')
    await expect(updatePage.errorSummary).toContainText('url must be provided')
  })

  test('Redirects to product config details page when back link is clicked', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })
    await page.goto('/admin/update-product-config')
    const updatePage = await verifyOnPage(page, AdminUpdateProductConfigPage)

    await updatePage.back()

    const detailsPage = await verifyOnPage(page, AdminProductConfigDetailsPage)
    expect(detailsPage.page.url()).toMatch(/admin\/product-config-details/)
  })
})
