import { expect, Page } from '@playwright/test'
import tokenVerification from './mockApis/tokenVerification'
import hmppsAuth, { type UserToken } from './mockApis/hmppsAuth'
import { resetStubs } from './mockApis/wiremock'
import AbstractPage from './pages/abstractPage'
import RegisterTemplateServicePage from './pages/registerTemplateServicePage'
import RegisterTemplateUploadPage from './pages/registerTemplateUploadPage'
import RegisterTemplateConfirmationPage from './pages/registerTemplateConfirmationPage'

export { resetStubs }

export const USER_ROLE = 'ROLE_SAR_USER_ACCESS'
export const ADMIN_ROLE = 'ROLE_SAR_ADMIN_ACCESS'
export const REGISTER_TEMPLATE_ROLE = 'ROLE_SAR_REGISTER_TEMPLATE'
const DEFAULT_ROLES = [USER_ROLE, ADMIN_ROLE, REGISTER_TEMPLATE_ROLE]

export const attemptHmppsAuthLogin = async (page: Page) => {
  await page.goto('/')
  page.locator('h1', { hasText: 'Sign in' })
  const url = await hmppsAuth.getSignInUrl()
  await page.goto(url)
}

export const login = async (
  page: Page,
  { name, roles = DEFAULT_ROLES, active = true, authSource = 'nomis' }: UserToken & { active?: boolean } = {},
) => {
  await Promise.all([
    hmppsAuth.favicon(),
    hmppsAuth.stubSignInPage(),
    hmppsAuth.stubSignOutPage(),
    hmppsAuth.token({ name, roles, authSource }),
    tokenVerification.stubVerifyToken(active),
  ])
  await attemptHmppsAuthLogin(page)
}

export const verifyOnPage = async <T extends AbstractPage>(
  page: Page,
  constructor: new (page: Page) => T,
): Promise<T> => {
  const pageInstance = new constructor(page)
  await expect(pageInstance.header).toBeVisible()
  return pageInstance
}

export const registerTemplateUpload = async (page: Page, { serviceId = '1' }) => {
  await login(page, { roles: [REGISTER_TEMPLATE_ROLE] })
  await page.goto('/register-template/select-service')
  const selectServicePage = await verifyOnPage(page, RegisterTemplateServicePage)
  await selectServicePage.selectService(serviceId)
  await selectServicePage.continue()
}

export const registerTemplateConfirmation = async (page: Page, { serviceId = '1' }) => {
  await registerTemplateUpload(page, { serviceId })
  const uploadPage = await verifyOnPage(page, RegisterTemplateUploadPage)
  await uploadPage.selectTemplateFile('template.mustache')
  await uploadPage.continue()
}

export const registerTemplateResult = async (page: Page, { serviceId = '1' }) => {
  await registerTemplateConfirmation(page, { serviceId })
  const confirmationPage = await verifyOnPage(page, RegisterTemplateConfirmationPage)
  await confirmationPage.confirm()
}
