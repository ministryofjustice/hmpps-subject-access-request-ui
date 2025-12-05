import { expect, test } from '@playwright/test'
import hmppsAuth from '../mockApis/hmppsAuth'
import sarApi from '../mockApis/sarApi'
import { ADMIN_ROLE, login, registerTemplateUpload, resetStubs, USER_ROLE, verifyOnPage } from '../testUtils'
import AuthSignInPage from '../pages/authSignInPage'
import AuthErrorPage from '../pages/authErrorPage'
import RegisterTemplateUploadPage from '../pages/registerTemplateUploadPage'

test.describe('Register template upload file', () => {
  test.beforeEach(async () => {
    await sarApi.stubGetProducts()
    await sarApi.stubGetTemplateVersions({})
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Redirects to auth if requested by unauthenticated user', async ({ page }) => {
    await hmppsAuth.stubSignInPage()
    await page.goto('/register-template/upload')

    await verifyOnPage(page, AuthSignInPage)
  })

  const unauthorisedRoles = [USER_ROLE, ADMIN_ROLE, 'ROLE_OTHER']
  test.describe('Redirects to authError if requested by user without appropriate role', () => {
    unauthorisedRoles.forEach(role => {
      test(`redirects to authError for role ${role} `, async ({ page }) => {
        await login(page, { roles: [role] })
        await page.goto('/register-template/upload')

        await verifyOnPage(page, AuthErrorPage)
      })
    })
  })

  test('Renders for authenticated users', async ({ page }) => {
    await registerTemplateUpload(page, {})
    const uploadPage = await verifyOnPage(page, RegisterTemplateUploadPage)

    await expect(uploadPage.header).toHaveText('Upload template for Service One')
    await expect(uploadPage.errorSummary).not.toBeVisible()
    await expect(uploadPage.notificationBanner).not.toBeVisible()
    await expect(uploadPage.versionTable).toBeVisible()
    const rows = uploadPage.versionTable.locator('tr')
    await expect(rows).toHaveCount(2)
    const cells = rows.nth(1).locator('td')
    await expect(cells).toHaveCount(4)
    await expect(cells.nth(0)).toContainText('1')
    await expect(cells.nth(1)).toContainText('123abc')
    await expect(cells.nth(2)).toContainText('13 June 2025 at 12:43:44 UTC')
    await expect(cells.nth(3)).toContainText('PUBLISHED')
  })

  test('Displays notification when latest version is PENDING', async ({ page }) => {
    await sarApi.stubGetTemplateVersions({ status: 'PENDING' })
    await registerTemplateUpload(page, {})
    const uploadPage = await verifyOnPage(page, RegisterTemplateUploadPage)

    await expect(uploadPage.header).toHaveText('Upload template for Service One')
    await expect(uploadPage.errorSummary).not.toBeVisible()
    await expect(uploadPage.notificationBanner).toContainText(
      'The latest template version registered for this product has not been activated. Registering a template will override this inactive version.',
    )
    await expect(uploadPage.versionTable).toBeVisible()
  })

  test('Displays notification when product not migrated', async ({ page }) => {
    await sarApi.stubGetTemplateVersions({ productId: '2' })
    await registerTemplateUpload(page, { productId: '2' })
    const uploadPage = await verifyOnPage(page, RegisterTemplateUploadPage)

    await expect(uploadPage.header).toHaveText('Upload template for Service Two')
    await expect(uploadPage.errorSummary).not.toBeVisible()
    await expect(uploadPage.warningAlert).toContainText(
      'This product has not been configured as having its template migrated. A template can still be registered but the configuration will need to be updated before it will be used.',
    )
    await expect(uploadPage.versionTable).toBeVisible()
  })

  test('Displays error when continue without file selected', async ({ page }) => {
    await registerTemplateUpload(page, {})
    const uploadPage = await verifyOnPage(page, RegisterTemplateUploadPage)

    await uploadPage.continue()

    await expect(uploadPage.header).toHaveText('Upload template for Service One')
    await expect(uploadPage.errorSummary).toContainText('Please select template file to upload')
    await expect(uploadPage.notificationBanner).not.toBeVisible()
    await expect(uploadPage.templateFileInputError).toContainText('Please select template file to upload')
    await expect(uploadPage.versionTable).toBeVisible()
  })

  test('Displays error when invalid template file selected', async ({ page }) => {
    await registerTemplateUpload(page, {})
    const uploadPage = await verifyOnPage(page, RegisterTemplateUploadPage)

    await uploadPage.selectTemplateFile('template.txt')
    await uploadPage.continue()

    await expect(uploadPage.header).toHaveText('Upload template for Service One')
    await expect(uploadPage.errorSummary).toContainText('Please ensure a mustache file is selected')
    await expect(uploadPage.notificationBanner).not.toBeVisible()
    await expect(uploadPage.templateFileInputError).toContainText('Please ensure a mustache file is selected')
    await expect(uploadPage.versionTable).toBeVisible()
  })

  test('Redirects to confirmation when continue with file selected', async ({ page }) => {
    await registerTemplateUpload(page, {})
    const uploadPage = await verifyOnPage(page, RegisterTemplateUploadPage)

    await uploadPage.selectTemplateFile('template.mustache')
    await uploadPage.continue()

    await expect(uploadPage.errorSummary).not.toBeVisible()
    expect(uploadPage.page.url()).toMatch(/register-template\/confirmation$/)
  })

  test('Redirects to select product when back link clicked', async ({ page }) => {
    await registerTemplateUpload(page, {})
    const uploadPage = await verifyOnPage(page, RegisterTemplateUploadPage)

    await uploadPage.back()

    expect(uploadPage.page.url()).toMatch(/register-template\/select-product/)
  })
})
