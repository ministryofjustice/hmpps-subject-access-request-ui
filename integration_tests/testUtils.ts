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
import RequestReportProductsPage from './pages/requestReportProductsPage'
import RequestReportSummaryPage from './pages/requestReportSummaryPage'
import AdminCreateProductConfigPage from './pages/adminCreateProductConfigPage'
import AdminProductConfigPage from './pages/adminProductConfigPage'
import AdminProductConfigDetailsPage from './pages/adminProductConfigDetailsPage'
import AdminUpdateProductConfigPage from './pages/adminUpdateProductConfigPage'
import AdminConfirmProductConfigPage from './pages/adminConfirmProductConfigPage'
import AdminProductConfigInputPage from './pages/adminProductConfigInputPage'

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

export const requestReportSubjectId = async (page: Page) => {
  await login(page, { roles: [USER_ROLE] })
  await page.goto('/subject-id')
  return verifyOnPage(page, RequestReportSubjectIdPage)
}

export const requestReportInputs = async (page: Page) => {
  const subjectIdPage = await requestReportSubjectId(page)
  await subjectIdPage.inputSubjectId('A1111AA')
  await subjectIdPage.continue()
  return verifyOnPage(page, RequestReportInputsPage)
}

export const requestReportProductSelection = async (page: Page) => {
  const inputsPage = await requestReportInputs(page)
  await inputsPage.inputCaseReference('Test123')
  await inputsPage.continue()
  return verifyOnPage(page, RequestReportProductsPage)
}

export const requestReportSummary = async (page: Page) => {
  const productsPage = await requestReportProductSelection(page)
  await productsPage.selectAll()
  await productsPage.continue()
  return verifyOnPage(page, RequestReportSummaryPage)
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

export const adminConfirmCreateProductConfigWithAllDetails = async (
  page: Page,
  enabledChecked = true,
  migratedChecked = true,
) => {
  await login(page, { roles: [ADMIN_ROLE] })
  await page.goto('/admin/create-product-config')
  const createPage = await verifyOnPage(page, AdminCreateProductConfigPage)
  await productConfigInputAllValues(createPage, enabledChecked, migratedChecked)
  await createPage.continue()
  return verifyOnPage(page, AdminConfirmProductConfigPage)
}

export const adminViewProductConfigDetails = async (page: Page, row = 0) => {
  await login(page, { roles: [ADMIN_ROLE] })
  await page.goto('/admin/product-config')
  const productConfigPage = await verifyOnPage(page, AdminProductConfigPage)
  await productConfigPage.selectProduct(row)
  return verifyOnPage(page, AdminProductConfigDetailsPage)
}

export const adminUpdateProductConfig = async (page: Page) => {
  const detailsPage = await adminViewProductConfigDetails(page)
  await detailsPage.edit()
  return verifyOnPage(page, AdminUpdateProductConfigPage)
}

export const adminConfirmUpdateProductConfig = async (page: Page, enabled = true, migrated = true) => {
  const updatePage = await adminUpdateProductConfig(page)
  await productConfigInputDifferentValues(updatePage, enabled, migrated)
  await updatePage.continue()
  return verifyOnPage(page, AdminConfirmProductConfigPage)
}

export const registerTemplateResult = async (page: Page, { productId = '1' }) => {
  await registerTemplateConfirmation(page, { productId })
  const confirmationPage = await verifyOnPage(page, RegisterTemplateConfirmationPage)
  await confirmationPage.confirm()
}

export const productConfigInputAllValues = async (
  inputPage: AdminProductConfigInputPage,
  enabledChecked = true,
  migratedChecked = true,
) => {
  await inputPage.inputName('service-one')
  await inputPage.inputLabel('My Service One')
  await inputPage.inputUrl('https://my-service-one')
  await inputPage.prisonCategoryRadio.check()
  await inputPage.enabledCheckbox.setChecked(enabledChecked)
  await inputPage.migratedCheckbox.setChecked(migratedChecked)
}

export const productConfigInputDifferentValues = async (
  inputPage: AdminProductConfigInputPage,
  enabled = false,
  migrated = false,
) => {
  await inputPage.inputName('service-two')
  await inputPage.inputLabel('My Service Two')
  await inputPage.inputUrl('https://my-service-two')
  await inputPage.probationCategoryRadio.check()
  await inputPage.enabledCheckbox.setChecked(enabled)
  await inputPage.migratedCheckbox.setChecked(migrated)
}

export const productConfigClearAllValues = async (inputPage: AdminProductConfigInputPage) => {
  await inputPage.inputName('')
  await inputPage.inputLabel('')
  await inputPage.inputUrl('')
  await inputPage.enabledCheckbox.uncheck()
  await inputPage.migratedCheckbox.uncheck()
}

export const productConfigExpectAllInputsToBeEmpty = async (inputPage: AdminProductConfigInputPage) => {
  await expect(inputPage.nameTextbox).toHaveValue('')
  await expect(inputPage.labelTextbox).toHaveValue('')
  await expect(inputPage.urlTextbox).toHaveValue('')
  await expect(inputPage.prisonCategoryRadio).not.toBeChecked()
  await expect(inputPage.probationCategoryRadio).not.toBeChecked()
  await expect(inputPage.enabledCheckbox).not.toBeChecked()
  await expect(inputPage.migratedCheckbox).not.toBeChecked()
}

export const productConfigExpectAllInputsFilled = async (inputPage: AdminProductConfigInputPage) => {
  await expect(inputPage.nameTextbox).toHaveValue('service-one')
  await expect(inputPage.labelTextbox).toHaveValue('My Service One')
  await expect(inputPage.urlTextbox).toHaveValue('https://my-service-one')
  await expect(inputPage.prisonCategoryRadio).toBeChecked()
  await expect(inputPage.probationCategoryRadio).not.toBeChecked()
  await expect(inputPage.enabledCheckbox).toBeChecked()
  await expect(inputPage.migratedCheckbox).toBeChecked()
}

export const productConfigExpectAllInputsFilledDifferent = async (inputPage: AdminProductConfigInputPage) => {
  await expect(inputPage.nameTextbox).toHaveValue('service-two')
  await expect(inputPage.labelTextbox).toHaveValue('My Service Two')
  await expect(inputPage.urlTextbox).toHaveValue('https://my-service-two')
  await expect(inputPage.prisonCategoryRadio).not.toBeChecked()
  await expect(inputPage.probationCategoryRadio).toBeChecked()
  await expect(inputPage.enabledCheckbox).not.toBeChecked()
  await expect(inputPage.migratedCheckbox).not.toBeChecked()
}

export const productConfigDetailsExpectAllSummary = async (detailsPage: AdminProductConfigDetailsPage) => {
  await expect(detailsPage.productConfigSummary).toContainText('service-one')
  await expect(detailsPage.productConfigSummary).toContainText('Service One')
  await expect(detailsPage.productConfigSummary).toContainText('http://service-one')
  await expect(detailsPage.productConfigSummary).toContainText('PRISON')
  await expect(detailsPage.productConfigSummary).toContainText('Enabled')
  await expect(detailsPage.productConfigSummary).toContainText('Migrated')
}
