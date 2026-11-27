import { expect, test } from '@playwright/test'
import hmppsAuth from '../mockApis/hmppsAuth'
import sarApi from '../mockApis/sarApi'
import { login, resetStubs, verifyOnPage } from '../testUtils'
import HomePage from '../pages/homePage'

test.describe('Footer', () => {
  test.beforeEach(async () => {
    await sarApi.stubGetProducts()
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Acceptable use statement link navigates to the auth terms page', async ({ page }) => {
    await hmppsAuth.stubTermsPage()
    await login(page)
    await page.goto('/')
    const homePage = await verifyOnPage(page, HomePage)

    const link = homePage.acceptableUseLink
    await expect(link).toHaveAttribute('href', '/terms')
    await link.click()

    await expect(page).toHaveURL(/\/auth\/terms/)
    await expect(page.getByRole('heading')).toHaveText('Acceptable use statement')
  })
})
