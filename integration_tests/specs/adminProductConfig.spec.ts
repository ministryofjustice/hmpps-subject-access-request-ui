import { expect, test } from '@playwright/test'
import hmppsAuth from '../mockApis/hmppsAuth'

import {
  ADMIN_ROLE,
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
import AdminProductConfigPage from '../pages/adminProductConfigPage'
import AdminCreateProductConfigPage from '../pages/adminCreateProductConfigPage'
import AdminProductConfigDetailsPage from '../pages/adminProductConfigDetailsPage'

test.describe('Admin Product Configurations', () => {
  test.beforeEach(async () => {
    await sarApi.stubGetProducts()
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Redirects to auth if requested by unauthenticated user', async ({ page }) => {
    await hmppsAuth.stubSignInPage()
    await page.goto('/admin/product-config')

    await verifyOnPage(page, AuthSignInPage)
  })

  const unauthorisedRoles = [USER_ROLE, REGISTER_TEMPLATE_ROLE, 'ROLE_OTHER']
  test.describe('Redirects to authError if requested by user without appropriate role', () => {
    unauthorisedRoles.forEach(role => {
      test(`redirects to authError for role ${role} `, async ({ page }) => {
        await login(page, { roles: [role] })
        await page.goto('/admin/product-config')

        await verifyOnPage(page, AuthErrorPage)
      })
    })
  })

  test('Renders for authenticated users', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })
    await page.goto('/admin/product-config')

    await verifyOnPage(page, AdminProductConfigPage)
  })

  test('Displays table of product config', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })
    await page.goto('/admin/product-config')
    const productConfigPage = await verifyOnPage(page, AdminProductConfigPage)

    await expect(productConfigPage.productsTable).toBeVisible()
    await expect(productConfigPage.productsTable).toContainText('Name')
    await expect(productConfigPage.productsTable).toContainText('Label')
    await expect(productConfigPage.productsTable).toContainText('Url')
    await expect(productConfigPage.productsTable).toContainText('Category')
    await expect(productConfigPage.productsTable).toContainText('Enabled')
    await expect(productConfigPage.productsTable).toContainText('Template migrated')
  })

  test('Displays product configuration details', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })
    await page.goto('/admin/product-config')
    const productConfigPage = await verifyOnPage(page, AdminProductConfigPage)

    await expect(productConfigPage.productsTableRow(0)).toBeVisible()
    await expect(productConfigPage.productsTableCell(0, 0)).toContainText('service-one')
    await expect(productConfigPage.productsTableCell(0, 1)).toContainText('Service One')
    await expect(productConfigPage.productsTableCell(0, 2)).toContainText('http://service-one')
    await expect(productConfigPage.productsTableCell(0, 3)).toContainText('PRISON')
    await expect(productConfigPage.productsTableCell(0, 4)).toContainText('Enabled')
    await expect(productConfigPage.productsTableCell(0, 5)).toContainText('Migrated')

    await expect(productConfigPage.productsTableRow(1)).toBeVisible()
    await expect(productConfigPage.productsTableCell(1, 0)).toContainText('service-two')
    await expect(productConfigPage.productsTableCell(1, 1)).toContainText('Service Two')
    await expect(productConfigPage.productsTableCell(1, 2)).toContainText('http://service-two')
    await expect(productConfigPage.productsTableCell(1, 3)).toContainText('PROBATION')
    await expect(productConfigPage.productsTableCell(1, 4)).toContainText('Enabled')
    await expect(productConfigPage.productsTableCell(1, 5)).toContainText('Not migrated')

    await expect(productConfigPage.productsTableRow(2)).toBeVisible()
    await expect(productConfigPage.productsTableCell(2, 0)).toContainText('service-three')
    await expect(productConfigPage.productsTableCell(2, 1)).toContainText('Service Three')
    await expect(productConfigPage.productsTableCell(2, 2)).toContainText('http://service-three')
    await expect(productConfigPage.productsTableCell(2, 3)).toContainText('PRISON')
    await expect(productConfigPage.productsTableCell(2, 4)).toContainText('Disabled')
    await expect(productConfigPage.productsTableCell(2, 5)).toContainText('Not migrated')
  })

  test('Displays create product config button which redirects to create page', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })
    await page.goto('/admin/product-config')
    const productConfigPage = await verifyOnPage(page, AdminProductConfigPage)

    await expect(productConfigPage.createProductConfigButton).toBeVisible()
    await productConfigPage.createProductConfig()

    const createPage = await verifyOnPage(page, AdminCreateProductConfigPage)
    expect(createPage.page.url()).toMatch(/admin\/create-product-config$/)
  })

  test('Can select product config to view details', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })
    await page.goto('/admin/product-config')
    const productConfigPage = await verifyOnPage(page, AdminProductConfigPage)

    await productConfigPage.selectProduct()

    const detailsPage = await verifyOnPage(page, AdminProductConfigDetailsPage)
    expect(detailsPage.page.url()).toMatch(/admin\/product-config-details/)
    await productConfigDetailsExpectAllSummary(detailsPage)
  })
})
