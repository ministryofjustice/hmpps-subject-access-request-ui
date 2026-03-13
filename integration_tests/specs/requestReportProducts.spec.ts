import { expect, test } from '@playwright/test'
import hmppsAuth from '../mockApis/hmppsAuth'

import { login, requestReportProductSelection, resetStubs, USER_ROLE, verifyOnPage } from '../testUtils'
import AuthSignInPage from '../pages/authSignInPage'
import RequestReportInputsPage from '../pages/requestReportInputsPage'
import AuthErrorPage from '../pages/authErrorPage'
import sarApi from '../mockApis/sarApi'
import RequestReportProductsPage from '../pages/requestReportProductsPage'

test.describe('Request Report - ProductSelection', () => {
  test.beforeEach(async () => {
    await sarApi.stubGetProducts()
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Redirects to auth if requested by unauthenticated user', async ({ page }) => {
    await hmppsAuth.stubSignInPage()
    await page.goto('/product-selection')

    await verifyOnPage(page, AuthSignInPage)
  })

  test('Redirects to authError if requested by user without appropriate role', async ({ page }) => {
    await login(page, { roles: ['ROLE_OTHER'] })
    await page.goto('/product-selection')

    await verifyOnPage(page, AuthErrorPage)
  })

  test('Renders for authenticated users', async ({ page }) => {
    await login(page, { roles: [USER_ROLE] })
    await page.goto('/product-selection')

    await verifyOnPage(page, RequestReportProductsPage)
  })

  test('Contains check all Checkbox', async ({ page }) => {
    const productSelectionPage = await requestReportProductSelection(page)

    await expect(productSelectionPage.checkAllCheckBox).toBeVisible()
    await expect(productSelectionPage.confirmButton).toBeVisible()
  })

  test('Contains suspended warning banner when one or more services is suspended', async ({ page }) => {
    const productSelectionPage = await requestReportProductSelection(page)

    await expect(productSelectionPage.checkAllCheckBox).toBeVisible()
    await expect(productSelectionPage.confirmButton).toBeVisible()
    await expect(productSelectionPage.suspendedProductsAlert).toBeVisible()
    await expect(productSelectionPage.suspendedProductsAlert).toContainText('Product Suspended')
    await expect(productSelectionPage.suspendedProductsAlertList.locator('li')).toHaveCount(1)
    await expect(productSelectionPage.suspendedProductsAlertList).toContainText('X Service')

    await expect(productSelectionPage.productsTableCells).toHaveCount(11)
    await expect(productSelectionPage.productsTableCells.nth(1)).toContainText('Service One')
    await expect(productSelectionPage.productsTableCells.nth(2)).toContainText('Active')

    await expect(productSelectionPage.productsTableCells.nth(6)).toContainText('Service Two')
    await expect(productSelectionPage.productsTableCells.nth(7)).toContainText('Active')

    await expect(productSelectionPage.productsTableCells.nth(9)).toContainText('X Service')
    await expect(productSelectionPage.productsTableCells.nth(10)).toContainText('Suspended')
  })

  test('Does not allow none product selected', async ({ page }) => {
    const productSelectionPage = await requestReportProductSelection(page)
    await productSelectionPage.continue()

    expect(productSelectionPage.page.url()).toMatch(/product-selection$/)
    await expect(productSelectionPage.errorSummary).toBeVisible()
  })

  test('Check all product when checkAll clicked once', async ({ page }) => {
    const productSelectionPage = await requestReportProductSelection(page)
    await productSelectionPage.selectAll()

    await expect(productSelectionPage.checkAllCheckBox).toBeChecked()
  })

  test('Uncheck all products when checkAll clicked twice', async ({ page }) => {
    const productSelectionPage = await requestReportProductSelection(page)
    await productSelectionPage.selectAll()
    await productSelectionPage.selectAll()

    await expect(productSelectionPage.checkAllCheckBox).not.toBeChecked()
  })

  test('Persists selected product when user returning to ProductSelect page', async ({ page }) => {
    const productSelectionPage = await requestReportProductSelection(page)
    await productSelectionPage.selectService('service-one')
    await productSelectionPage.continue()
    await page.goto('/product-selection')

    await expect(productSelectionPage.serviceCheckbox('service-one')).toBeChecked()
  })

  test('redirects to inputs page when back link is clicked', async ({ page }) => {
    const productSelectionPage = await requestReportProductSelection(page)
    await productSelectionPage.back()

    await verifyOnPage(page, RequestReportInputsPage)
  })
})
