import { expect, Request, test } from '@playwright/test'
import hmppsAuth from '../mockApis/hmppsAuth'

import {
  ADMIN_ROLE,
  adminConfirmProductConfigWithAllDetails,
  login,
  productConfigExpectAllInputsFilled,
  productConfigExpectAllInputsToBeEmpty,
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
import AdminConfirmProductConfigPage from '../pages/adminConfirmProductConfigPage'

test.describe('Admin Confirm Product Configuration', () => {
  test.beforeEach(async () => {
    await sarApi.stubGetProducts()
    await sarApi.stubCreateProduct()
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Redirects to auth if requested by unauthenticated user', async ({ page }) => {
    await hmppsAuth.stubSignInPage()
    await page.goto('/admin/confirm-product-config')

    await verifyOnPage(page, AuthSignInPage)
  })

  const unauthorisedRoles = [USER_ROLE, REGISTER_TEMPLATE_ROLE, 'ROLE_OTHER']
  test.describe('Redirects to authError if requested by user without appropriate role', () => {
    unauthorisedRoles.forEach(role => {
      test(`redirects to authError for role ${role} `, async ({ page }) => {
        await login(page, { roles: [role] })
        await page.goto('/admin/confirm-product-config')

        await verifyOnPage(page, AuthErrorPage)
      })
    })
  })

  test('Renders for authenticated users', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })

    await page.goto('/admin/confirm-product-config')
    const confirmPage = await verifyOnPage(page, AdminConfirmProductConfigPage)

    await expect(confirmPage.productConfigSummary).toBeVisible()
    await expect(confirmPage.changeNameLink).toBeVisible()
    await expect(confirmPage.changeLabelLink).toBeVisible()
    await expect(confirmPage.changeUrlLink).toBeVisible()
    await expect(confirmPage.changeCategoryLink).toBeVisible()
    await expect(confirmPage.changeEnabledLink).toBeVisible()
    await expect(confirmPage.changeMigratedLink).toBeVisible()
    await expect(confirmPage.backLink).toBeVisible()
    await expect(confirmPage.acceptButton).toBeVisible()
    await expect(confirmPage.cancelButton).toBeVisible()
    await expect(confirmPage.errorSummary).not.toBeVisible()
  })

  test('Renders provided product config details', async ({ page }) => {
    await adminConfirmProductConfigWithAllDetails(page)
    const confirmPage = await verifyOnPage(page, AdminConfirmProductConfigPage)

    await expect(confirmPage.productConfigSummary).toContainText('service-one')
    await expect(confirmPage.productConfigSummary).toContainText('My Service One')
    await expect(confirmPage.productConfigSummary).toContainText('https://my-service-one')
    await expect(confirmPage.productConfigSummary).toContainText('PRISONS')
    await expect(confirmPage.productConfigSummary).toContainText('Enabled')
    await expect(confirmPage.productConfigSummary).toContainText('Migrated')
  })

  test('Renders provided product config details when checkboxes not selected', async ({ page }) => {
    await adminConfirmProductConfigWithAllDetails(page, false, false)
    const confirmPage = await verifyOnPage(page, AdminConfirmProductConfigPage)

    await expect(confirmPage.productConfigSummary).toContainText('service-one')
    await expect(confirmPage.productConfigSummary).toContainText('My Service One')
    await expect(confirmPage.productConfigSummary).toContainText('https://my-service-one')
    await expect(confirmPage.productConfigSummary).toContainText('PRISONS')
    await expect(confirmPage.productConfigSummary).toContainText('Disabled')
    await expect(confirmPage.productConfigSummary).toContainText('Not migrated')
  })

  test('Change name value redirects to create page', async ({ page }) => {
    await adminConfirmProductConfigWithAllDetails(page)
    const confirmPage = await verifyOnPage(page, AdminConfirmProductConfigPage)
    await confirmPage.changeName()

    const createPage = await verifyOnPage(page, AdminCreateProductConfigPage)
    expect(createPage.page.url()).toMatch(/admin\/create-product-config$/)
    await productConfigExpectAllInputsFilled(createPage)
  })

  test('Change label value redirects to create page', async ({ page }) => {
    await adminConfirmProductConfigWithAllDetails(page)
    const confirmPage = await verifyOnPage(page, AdminConfirmProductConfigPage)
    await confirmPage.changeLabel()

    const createPage = await verifyOnPage(page, AdminCreateProductConfigPage)
    expect(createPage.page.url()).toMatch(/admin\/create-product-config$/)
    await productConfigExpectAllInputsFilled(createPage)
  })

  test('Change url value redirects to create page', async ({ page }) => {
    await adminConfirmProductConfigWithAllDetails(page)
    const confirmPage = await verifyOnPage(page, AdminConfirmProductConfigPage)
    await confirmPage.changeUrl()

    const createPage = await verifyOnPage(page, AdminCreateProductConfigPage)
    expect(createPage.page.url()).toMatch(/admin\/create-product-config$/)
    await productConfigExpectAllInputsFilled(createPage)
  })

  test('Change category value redirects to create page', async ({ page }) => {
    await adminConfirmProductConfigWithAllDetails(page)
    const confirmPage = await verifyOnPage(page, AdminConfirmProductConfigPage)
    await confirmPage.changeCategory()

    const createPage = await verifyOnPage(page, AdminCreateProductConfigPage)
    expect(createPage.page.url()).toMatch(/admin\/create-product-config$/)
    await productConfigExpectAllInputsFilled(createPage)
  })

  test('Change enabled value redirects to create page', async ({ page }) => {
    await adminConfirmProductConfigWithAllDetails(page)
    const confirmPage = await verifyOnPage(page, AdminConfirmProductConfigPage)
    await confirmPage.changeEnabled()

    const createPage = await verifyOnPage(page, AdminCreateProductConfigPage)
    expect(createPage.page.url()).toMatch(/admin\/create-product-config$/)
    await productConfigExpectAllInputsFilled(createPage)
  })

  test('Change template migrated value redirects to create page', async ({ page }) => {
    await adminConfirmProductConfigWithAllDetails(page)
    const confirmPage = await verifyOnPage(page, AdminConfirmProductConfigPage)
    await confirmPage.changeMigrated()

    const createPage = await verifyOnPage(page, AdminCreateProductConfigPage)
    expect(createPage.page.url()).toMatch(/admin\/create-product-config$/)
    await productConfigExpectAllInputsFilled(createPage)
  })

  test('Redirects to view product config on clicking accept button and details cleared', async ({ page }) => {
    await adminConfirmProductConfigWithAllDetails(page)
    const confirmPage = await verifyOnPage(page, AdminConfirmProductConfigPage)
    await Promise.all([page.waitForRequest(createProductConfigRequest()), confirmPage.accept()])

    const productConfigPage = await verifyOnPage(page, AdminProductConfigPage)
    expect(productConfigPage.page.url()).toMatch(/admin\/product-config$/)
    await productConfigPage.createProductConfig()
    const createPage = await verifyOnPage(page, AdminCreateProductConfigPage)
    await productConfigExpectAllInputsToBeEmpty(createPage)
  })

  test('Redirects to view product config on clicking cancel button and details cleared', async ({ page }) => {
    await adminConfirmProductConfigWithAllDetails(page)
    const confirmPage = await verifyOnPage(page, AdminConfirmProductConfigPage)
    await confirmPage.cancel()

    const productConfigPage = await verifyOnPage(page, AdminProductConfigPage)
    expect(productConfigPage.page.url()).toMatch(/admin\/product-config$/)
    await productConfigPage.createProductConfig()
    const createPage = await verifyOnPage(page, AdminCreateProductConfigPage)
    await productConfigExpectAllInputsToBeEmpty(createPage)
  })

  test('Redirects to create product config page when back link is clicked', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })
    await page.goto('/admin/confirm-product-config')
    const confirmPage = await verifyOnPage(page, AdminConfirmProductConfigPage)

    await confirmPage.back()

    const createPage = await verifyOnPage(page, AdminCreateProductConfigPage)
    expect(createPage.page.url()).toMatch(/admin\/create-product-config$/)
  })

  test('Redirects to create product config page when back link is clicked and all inputs retained', async ({
    page,
  }) => {
    await adminConfirmProductConfigWithAllDetails(page)
    const confirmPage = await verifyOnPage(page, AdminConfirmProductConfigPage)

    await confirmPage.back()

    const createPage = await verifyOnPage(page, AdminCreateProductConfigPage)
    expect(createPage.page.url()).toMatch(/admin\/create-product-config$/)
    await productConfigExpectAllInputsFilled(createPage)
  })

  const createProductConfigRequest = () => (req: Request) =>
    req.method() === 'POST' && new URL(req.url()).pathname.endsWith('/admin/confirm-product-config')
})
