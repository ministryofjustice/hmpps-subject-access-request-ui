import { expect, Request, test } from '@playwright/test'
import hmppsAuth from '../mockApis/hmppsAuth'

import {
  ADMIN_ROLE,
  adminConfirmUpdateProductConfig,
  login,
  productConfigDetailsExpectAllSummary,
  productConfigExpectAllInputsFilledDifferent,
  REGISTER_TEMPLATE_ROLE,
  resetStubs,
  USER_ROLE,
  verifyOnPage,
} from '../testUtils'
import AuthSignInPage from '../pages/authSignInPage'
import AuthErrorPage from '../pages/authErrorPage'
import sarApi from '../mockApis/sarApi'
import AdminConfirmProductConfigPage from '../pages/adminConfirmProductConfigPage'
import AdminUpdateProductConfigPage from '../pages/adminUpdateProductConfigPage'
import AdminProductConfigDetailsPage from '../pages/adminProductConfigDetailsPage'

test.describe('Admin Confirm Update Product Configuration', () => {
  test.beforeEach(async () => {
    await sarApi.stubGetProducts()
    await sarApi.stubUpdateProduct()
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Redirects to auth if requested by unauthenticated user', async ({ page }) => {
    await hmppsAuth.stubSignInPage()
    await page.goto('/admin/confirm-update-product-config')

    await verifyOnPage(page, AuthSignInPage)
  })

  const unauthorisedRoles = [USER_ROLE, REGISTER_TEMPLATE_ROLE, 'ROLE_OTHER']
  test.describe('Redirects to authError if requested by user without appropriate role', () => {
    unauthorisedRoles.forEach(role => {
      test(`redirects to authError for role ${role} `, async ({ page }) => {
        await login(page, { roles: [role] })
        await page.goto('/admin/confirm-update-product-config')

        await verifyOnPage(page, AuthErrorPage)
      })
    })
  })

  test('Renders for authenticated users', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })

    await page.goto('/admin/confirm-update-product-config')
    const confirmPage = await verifyOnPage(page, AdminConfirmProductConfigPage)

    await expect(confirmPage.productConfigSummary).toBeVisible()
    await expect(confirmPage.changeLink).toBeVisible()
    await expect(confirmPage.backLink).toBeVisible()
    await expect(confirmPage.createButton).not.toBeVisible()
    await expect(confirmPage.updateButton).toBeVisible()
    await expect(confirmPage.cancelButton).toBeVisible()
    await expect(confirmPage.warningAlert).toBeVisible()
    await expect(confirmPage.warningAlert).toContainText('Changes can affect subject access requests in progress.')
    await expect(confirmPage.warningAlert).toContainText(
      'Any changes made to the product configuration could adversely impact any subject access requests which include this product currently in progress. Only continue if you are aware of the impact and are sure any changes are necessary.',
    )
    await expect(confirmPage.errorSummary).not.toBeVisible()
  })

  test('Renders provided product config details', async ({ page }) => {
    const confirmPage = await adminConfirmUpdateProductConfig(page)

    await productConfigExpectAllSummaryDifferentDetails(confirmPage)
  })

  test('Renders provided product config details when checkboxes not selected', async ({ page }) => {
    const confirmPage = await adminConfirmUpdateProductConfig(page, false, false)

    await productConfigExpectAllSummaryDifferentDetails(confirmPage, 'Disabled', 'Not migrated')
  })

  test('Change details redirects to update page', async ({ page }) => {
    const confirmPage = await adminConfirmUpdateProductConfig(page, false, false)
    await confirmPage.change()

    const updatePage = await verifyOnPage(page, AdminUpdateProductConfigPage)
    expect(updatePage.page.url()).toMatch(/admin\/update-product-config$/)
    await productConfigExpectAllInputsFilledDifferent(updatePage)
  })

  test('Redirects to view product config details on clicking update button and new details persisted', async ({
    page,
  }) => {
    const confirmPage = await adminConfirmUpdateProductConfig(page, false, false)
    await Promise.all([page.waitForRequest(updateProductConfigRequest()), confirmPage.update()])

    const detailsPage = await verifyOnPage(page, AdminProductConfigDetailsPage)
    expect(detailsPage.page.url()).toMatch(/admin\/product-config-details/)

    await productConfigDetailsExpectAllSummary(detailsPage)
  })

  test('Renders error when clicking update button and api error', async ({ page }) => {
    await sarApi.stubUpdateProduct(500, 1)
    let confirmPage = await adminConfirmUpdateProductConfig(page)
    await Promise.all([page.waitForRequest(updateProductConfigRequest()), confirmPage.update()])

    confirmPage = await verifyOnPage(page, AdminConfirmProductConfigPage)
    expect(confirmPage.page.url()).toMatch(/admin\/confirm-update-product-config$/)
    await productConfigExpectAllSummaryDifferentDetails(confirmPage)
    await expect(confirmPage.errorSummary).toBeVisible()
    await expect(confirmPage.errorSummary).toContainText('Problem updating product configuration')
    await expect(confirmPage.errorSummary).toContainText('Internal Server Error')
  })

  test('Redirects to view product config details on clicking cancel button and old details kept', async ({ page }) => {
    const confirmPage = await adminConfirmUpdateProductConfig(page)
    await confirmPage.cancel()

    const detailsPage = await verifyOnPage(page, AdminProductConfigDetailsPage)
    expect(detailsPage.page.url()).toMatch(/admin\/product-config-details/)
    await productConfigDetailsExpectAllSummary(detailsPage)
  })

  test('Redirects to update product config page when back link is clicked', async ({ page }) => {
    const confirmPage = await adminConfirmUpdateProductConfig(page, false, false)

    await confirmPage.back()

    const updatePage = await verifyOnPage(page, AdminUpdateProductConfigPage)
    expect(updatePage.page.url()).toMatch(/admin\/update-product-config$/)
    await productConfigExpectAllInputsFilledDifferent(updatePage)
  })

  const updateProductConfigRequest = () => (req: Request) =>
    req.method() === 'POST' && new URL(req.url()).pathname.endsWith('/admin/confirm-update-product-config')

  const productConfigExpectAllSummaryDifferentDetails = async (
    confirmPage: AdminConfirmProductConfigPage,
    enabledText = 'Enabled',
    migratedText = 'Migrated',
  ) => {
    await expect(confirmPage.productConfigSummary).toContainText('service-two')
    await expect(confirmPage.productConfigSummary).toContainText('My Service Two')
    await expect(confirmPage.productConfigSummary).toContainText('https://my-service-two')
    await expect(confirmPage.productConfigSummary).toContainText('PROBATION')
    await expect(confirmPage.productConfigSummary).toContainText(enabledText)
    await expect(confirmPage.productConfigSummary).toContainText(migratedText)
  }
})
