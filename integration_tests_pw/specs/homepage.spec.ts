import { expect, test } from '@playwright/test'
import hmppsAuth from '../mockApis/hmppsAuth'
import { ADMIN_ROLE, login, REGISTER_TEMPLATE_ROLE, resetStubs, USER_ROLE, verifyOnPage } from '../testUtils'
import HomePage from '../pages/homePage'
import AuthSignInPage from '../pages/authSignInPage'

test.describe('Homepage', () => {
  test.beforeEach(async () => {})

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Redirects to auth if requested by unauthenticated user', async ({ page }) => {
    await hmppsAuth.stubSignInPage()
    await page.goto('/')

    await verifyOnPage(page, AuthSignInPage)
  })

  test('Renders for authenticated users', async ({ page }) => {
    await login(page)
    await page.goto('/')

    await verifyOnPage(page, HomePage)
  })

  test('Displays SAR action cards when not admin', async ({ page }) => {
    await login(page, { roles: [USER_ROLE] })
    await page.goto('/')

    const homepage = await verifyOnPage(page, HomePage)

    await expect(homepage.sarActionCards).toBeVisible()
    await expect(homepage.requestReportLink).toBeVisible()
    await expect(homepage.viewReportsLink).toBeVisible()
    await expect(homepage.adminLink).not.toBeVisible()
    await expect(homepage.registerTemplateLink).not.toBeVisible()
  })

  test('Displays SAR action cards when admin', async ({ page }) => {
    await login(page, { roles: [ADMIN_ROLE] })
    await page.goto('/')

    const homepage = await verifyOnPage(page, HomePage)

    await expect(homepage.sarActionCards).toBeVisible()
    await expect(homepage.requestReportLink).not.toBeVisible()
    await expect(homepage.viewReportsLink).not.toBeVisible()
    await expect(homepage.adminLink).toBeVisible()
    await expect(homepage.registerTemplateLink).not.toBeVisible()
  })

  test('Displays SAR action cards when register template', async ({ page }) => {
    await login(page, { roles: [REGISTER_TEMPLATE_ROLE] })
    await page.goto('/')

    const homepage = await verifyOnPage(page, HomePage)

    await expect(homepage.sarActionCards).toBeVisible()
    await expect(homepage.requestReportLink).not.toBeVisible()
    await expect(homepage.viewReportsLink).not.toBeVisible()
    await expect(homepage.adminLink).not.toBeVisible()
    await expect(homepage.registerTemplateLink).toBeVisible()
  })

  test('Displays SAR action cards when all SAR roles', async ({ page }) => {
    await login(page, { roles: ['ROLE_SAR_USER_ACCESS', 'ROLE_SAR_ADMIN_ACCESS', 'ROLE_SAR_REGISTER_TEMPLATE'] })
    await page.goto('/')

    const homepage = await verifyOnPage(page, HomePage)

    await expect(homepage.sarActionCards).toBeVisible()
    await expect(homepage.requestReportLink).toBeVisible()
    await expect(homepage.viewReportsLink).toBeVisible()
    await expect(homepage.adminLink).toBeVisible()
    await expect(homepage.registerTemplateLink).toBeVisible()
  })

  test('Redirects to /subject-id on clicking Request a report link', async ({ page }) => {
    await login(page)
    await page.goto('/')
    const homepage = await verifyOnPage(page, HomePage)
    await homepage.requestReport()

    homepage.page.url().match(/subject-id$/)
  })

  test('Redirects to /reports on clicking View reports link', async ({ page }) => {
    await login(page)
    await page.goto('/')
    const homepage = await verifyOnPage(page, HomePage)
    await homepage.viewReports()

    homepage.page.url().match(/reports$/)
  })

  test('Redirects to /admin on clicking Admin link', async ({ page }) => {
    await login(page)
    await page.goto('/')
    const homepage = await verifyOnPage(page, HomePage)
    await homepage.admin()

    homepage.page.url().match(/admin$/)
  })

  test('Redirects to /register-template/select-service on clicking Register Template link', async ({ page }) => {
    await login(page)
    await page.goto('/')
    const homepage = await verifyOnPage(page, HomePage)
    await homepage.registerTemplate()

    homepage.page.url().match(/admin$/)
  })
})
