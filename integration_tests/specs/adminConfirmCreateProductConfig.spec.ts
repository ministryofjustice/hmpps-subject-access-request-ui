import { expect, Request, test } from '@playwright/test'
import hmppsAuth from '../mockApis/hmppsAuth'

import {
  ADMIN_ROLE,
  adminConfirmCreateProductConfigWithAllDetails,
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

test.describe('Admin Confirm Create Product Configuration', () => {
  test.beforeEach(async () => {
    await sarApi.stubGetProducts()
    await sarApi.stubCreateProduct()
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Redirects to auth if requested by unauthenticated user', async ({ page }) => {
    await hmppsAuth.stubSignInPage()
    await page.goto('/admin/confirm-create-product-config')

    await verifyOnPage(page, AuthSignInPage)
  })

  const unauthorisedRoles = [USER_ROLE, REGISTER_TEMPLATE_ROLE, 'ROLE_OTHER']
  test.describe('Redirects to authError if requested by user without appropriate role', () => {
    unauthorisedRoles.forEach(role => {
      test(`redirects to authError for role ${role} `, async ({ page }) => {
        await login(page, { roles: [role] })
        await page.goto('/admin/confirm-create-product-config')

        await verifyOnPage(page, AuthErrorPage)
      })
    })
  })

  test('Renders for authenticated users', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })

    await page.goto('/admin/confirm-create-product-config')
    const confirmPage = await verifyOnPage(page, AdminConfirmProductConfigPage)

    await expect(confirmPage.productConfigSummary).toBeVisible()
    await expect(confirmPage.changeLink).toBeVisible()
    await expect(confirmPage.backLink).toBeVisible()
    await expect(confirmPage.createButton).toBeVisible()
    await expect(confirmPage.updateButton).not.toBeVisible()
    await expect(confirmPage.cancelButton).toBeVisible()
    await expect(confirmPage.warningAlert).not.toBeVisible()
    await expect(confirmPage.errorSummary).not.toBeVisible()
  })

  test('Renders provided product config details', async ({ page }) => {
    const confirmPage = await adminConfirmCreateProductConfigWithAllDetails(page)

    await productConfigExpectAllSummaryDetails(confirmPage)
  })

  test('Renders provided product config details when checkboxes not selected', async ({ page }) => {
    const confirmPage = await adminConfirmCreateProductConfigWithAllDetails(page, false, false)

    await productConfigExpectAllSummaryDetails(confirmPage, 'Disabled', 'Not migrated')
  })

  test('Change details redirects to create page', async ({ page }) => {
    const confirmPage = await adminConfirmCreateProductConfigWithAllDetails(page)
    await confirmPage.change()

    const createPage = await verifyOnPage(page, AdminCreateProductConfigPage)
    expect(createPage.page.url()).toMatch(/admin\/create-product-config$/)
    await productConfigExpectAllInputsFilled(createPage)
  })

  test('Redirects to view product config on clicking accept button and details cleared', async ({ page }) => {
    const confirmPage = await adminConfirmCreateProductConfigWithAllDetails(page)
    await Promise.all([page.waitForRequest(createProductConfigRequest()), confirmPage.create()])

    const productConfigPage = await verifyOnPage(page, AdminProductConfigPage)
    expect(productConfigPage.page.url()).toMatch(/admin\/product-config$/)
    await productConfigPage.createProductConfig()
    const createPage = await verifyOnPage(page, AdminCreateProductConfigPage)
    await productConfigExpectAllInputsToBeEmpty(createPage)
  })

  test('Renders error when clicking update button and api error', async ({ page }) => {
    await sarApi.stubCreateProduct(500)
    let confirmPage = await adminConfirmCreateProductConfigWithAllDetails(page)
    await Promise.all([page.waitForRequest(createProductConfigRequest()), confirmPage.create()])

    confirmPage = await verifyOnPage(page, AdminConfirmProductConfigPage)
    expect(confirmPage.page.url()).toMatch(/admin\/confirm-create-product-config$/)
    await productConfigExpectAllSummaryDetails(confirmPage)
    await expect(confirmPage.errorSummary).toBeVisible()
    await expect(confirmPage.errorSummary).toContainText('Problem creating product configuration\n')
    await expect(confirmPage.errorSummary).toContainText('Internal Server Error')
  })

  test('Redirects to view product config on clicking cancel button and details cleared', async ({ page }) => {
    const confirmPage = await adminConfirmCreateProductConfigWithAllDetails(page)
    await confirmPage.cancel()

    const productConfigPage = await verifyOnPage(page, AdminProductConfigPage)
    expect(productConfigPage.page.url()).toMatch(/admin\/product-config$/)
    await productConfigPage.createProductConfig()
    const createPage = await verifyOnPage(page, AdminCreateProductConfigPage)
    await productConfigExpectAllInputsToBeEmpty(createPage)
  })

  test('Redirects to create product config page when back link is clicked', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })
    await page.goto('/admin/confirm-create-product-config')
    const confirmPage = await verifyOnPage(page, AdminConfirmProductConfigPage)

    await confirmPage.back()

    const createPage = await verifyOnPage(page, AdminCreateProductConfigPage)
    expect(createPage.page.url()).toMatch(/admin\/create-product-config$/)
  })

  test('Redirects to create product config page when back link is clicked and all inputs retained', async ({
    page,
  }) => {
    const confirmPage = await adminConfirmCreateProductConfigWithAllDetails(page)

    await confirmPage.back()

    const createPage = await verifyOnPage(page, AdminCreateProductConfigPage)
    expect(createPage.page.url()).toMatch(/admin\/create-product-config$/)
    await productConfigExpectAllInputsFilled(createPage)
  })

  const createProductConfigRequest = () => (req: Request) =>
    req.method() === 'POST' && new URL(req.url()).pathname.endsWith('/admin/confirm-create-product-config')

  const productConfigExpectAllSummaryDetails = async (
    confirmPage: AdminConfirmProductConfigPage,
    enabledText = 'Enabled',
    migratedText = 'Migrated',
  ) => {
    await expect(confirmPage.productConfigSummary).toContainText('service-one')
    await expect(confirmPage.productConfigSummary).toContainText('My Service One')
    await expect(confirmPage.productConfigSummary).toContainText('https://my-service-one')
    await expect(confirmPage.productConfigSummary).toContainText('PRISON')
    await expect(confirmPage.productConfigSummary).toContainText(enabledText)
    await expect(confirmPage.productConfigSummary).toContainText(migratedText)
  }
})
