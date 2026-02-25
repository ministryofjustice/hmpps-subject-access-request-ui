import { expect, test } from '@playwright/test'
import hmppsAuth from '../mockApis/hmppsAuth'

import {
  ADMIN_ROLE,
  adminViewProductConfigDetails,
  login,
  productConfigDetailsExpectAllSummary,
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
import AdminProductConfigPage from '../pages/adminProductConfigPage'

test.describe('Admin Product Configuration Details', () => {
  test.beforeEach(async () => {
    await sarApi.stubGetProducts()
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Redirects to auth if requested by unauthenticated user', async ({ page }) => {
    await hmppsAuth.stubSignInPage()
    await page.goto('/admin/product-config-details')

    await verifyOnPage(page, AuthSignInPage)
  })

  const unauthorisedRoles = [USER_ROLE, REGISTER_TEMPLATE_ROLE, 'ROLE_OTHER']
  test.describe('Redirects to authError if requested by user without appropriate role', () => {
    unauthorisedRoles.forEach(role => {
      test(`redirects to authError for role ${role} `, async ({ page }) => {
        await login(page, { roles: [role] })
        await page.goto('/admin/product-config-details')

        await verifyOnPage(page, AuthErrorPage)
      })
    })
  })

  test('Renders for authenticated users', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })

    await page.goto('/admin/product-config-details?id=1')
    const detailsPage = await verifyOnPage(page, AdminProductConfigDetailsPage)

    await expect(detailsPage.productConfigSummary).toBeVisible()
    await expect(detailsPage.editLink).toBeVisible()
    await expect(detailsPage.backLink).toBeVisible()
    await expect(detailsPage.errorSummary).not.toBeVisible()
  })

  test('Renders product config details', async ({ page }) => {
    const detailsPage = await adminViewProductConfigDetails(page)

    await productConfigDetailsExpectAllSummary(detailsPage)
  })

  test('Renders product config details when checkboxes not selected', async ({ page }) => {
    const detailsPage = await adminViewProductConfigDetails(page, 1)

    await expect(detailsPage.productConfigSummary).toContainText('service-three')
    await expect(detailsPage.productConfigSummary).toContainText('Service Three')
    await expect(detailsPage.productConfigSummary).toContainText('http://service-three')
    await expect(detailsPage.productConfigSummary).toContainText('PRISON')
    await expect(detailsPage.productConfigSummary).toContainText('Disabled')
    await expect(detailsPage.productConfigSummary).toContainText('Not migrated')
  })

  test('Renders error when problem finding product details', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })

    await page.goto('/admin/product-config-details?id=7654321')
    const detailsPage = await verifyOnPage(page, AdminProductConfigDetailsPage)

    await expect(detailsPage.productConfigSummary).toBeVisible()
    await expect(detailsPage.editLink).not.toBeVisible()
    await expect(detailsPage.backLink).toBeVisible()
    await expect(detailsPage.errorSummary).toBeVisible()
    await expect(detailsPage.errorSummary).toContainText('No product found with id 7654321')
  })

  test('Edit details redirects to update page', async ({ page }) => {
    const detailsPage = await adminViewProductConfigDetails(page)
    await detailsPage.edit()

    const updatePage = await verifyOnPage(page, AdminUpdateProductConfigPage)
    expect(updatePage.page.url()).toMatch(/admin\/update-product-config$/)
    await expect(updatePage.nameTextbox).toHaveValue('service-one')
    await expect(updatePage.labelTextbox).toHaveValue('Service One')
    await expect(updatePage.urlTextbox).toHaveValue('http://service-one')
    await expect(updatePage.prisonCategoryRadio).toBeChecked()
    await expect(updatePage.probationCategoryRadio).not.toBeChecked()
    await expect(updatePage.enabledCheckbox).toBeChecked()
    await expect(updatePage.migratedCheckbox).toBeChecked()
  })

  test('Redirects to view product config page when back link is clicked', async ({ page }) => {
    const detailsPage = await adminViewProductConfigDetails(page)
    await detailsPage.back()

    const viewProductConfigPage = await verifyOnPage(page, AdminProductConfigPage)
    expect(viewProductConfigPage.page.url()).toMatch(/admin\/product-config$/)
  })
})
