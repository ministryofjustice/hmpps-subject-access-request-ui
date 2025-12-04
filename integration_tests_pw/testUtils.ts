import { expect, Page } from '@playwright/test'
import tokenVerification from './mockApis/tokenVerification'
import hmppsAuth, { type UserToken } from './mockApis/hmppsAuth'
import { resetStubs } from './mockApis/wiremock'
import AbstractPage from './pages/abstractPage'
import RegisterTemplateProductPage from './pages/registerTemplateProductPage'
import RegisterTemplateUploadPage from './pages/registerTemplateUploadPage'
import RegisterTemplateConfirmationPage from './pages/registerTemplateConfirmationPage'
import RequestReportSubjectIdPage from './pages/requestReportSubjectIdPage'
import RequestReportInputsPage from './pages/requestReportInputsPage'

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

export const requestReportInputs = async (page: Page) => {
  await login(page, { roles: [USER_ROLE] })
  await page.goto('/subject-id')
  const subjectIdPage = await verifyOnPage(page, RequestReportSubjectIdPage)
  await subjectIdPage.inputSubjectId('A1111AA')
  await subjectIdPage.continue()
  return verifyOnPage(page, RequestReportInputsPage)
}

export const registerTemplateUpload = async (page: Page, { productId = '1' }) => {
  await login(page, { roles: [REGISTER_TEMPLATE_ROLE] })
  await page.goto('/register-template/select-product')
  const selectProductPage = await verifyOnPage(page, RegisterTemplateProductPage)
  await selectProductPage.selectProduct(productId)
  await selectProductPage.continue()
}

export const registerTemplateConfirmation = async (page: Page, { productId = '1' }) => {
  await registerTemplateUpload(page, { productId })
  const uploadPage = await verifyOnPage(page, RegisterTemplateUploadPage)
  await uploadPage.selectTemplateFile('template.mustache')
  await uploadPage.continue()
}

export const registerTemplateResult = async (page: Page, { productId = '1' }) => {
  await registerTemplateConfirmation(page, { productId })
  const confirmationPage = await verifyOnPage(page, RegisterTemplateConfirmationPage)
  await confirmationPage.confirm()
}
