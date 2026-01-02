import { expect, test } from '@playwright/test'
import hmppsAuth from '../mockApis/hmppsAuth'

import { login, requestReportInputs, requestReportSummary, resetStubs, USER_ROLE, verifyOnPage } from '../testUtils'
import AuthSignInPage from '../pages/authSignInPage'
import RequestReportInputsPage from '../pages/requestReportInputsPage'
import AuthErrorPage from '../pages/authErrorPage'
import sarApi from '../mockApis/sarApi'
import RequestReportProductsPage from '../pages/requestReportProductsPage'
import RequestReportSummaryPage from '../pages/requestReportSummaryPage'
import RequestReportSubjectIdPage from '../pages/requestReportSubjectIdPage'

test.describe('Request Report - Summary', () => {
  test.beforeEach(async () => {
    await sarApi.stubGetProducts()
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Redirects to auth if requested by unauthenticated user', async ({ page }) => {
    await hmppsAuth.stubSignInPage()
    await page.goto('/summary')

    await verifyOnPage(page, AuthSignInPage)
  })

  test('Redirects to authError if requested by user without appropriate role', async ({ page }) => {
    await login(page, { roles: ['ROLE_OTHER'] })
    await page.goto('/summary')

    await verifyOnPage(page, AuthErrorPage)
  })

  test('Renders for authenticated users', async ({ page }) => {
    await login(page, { roles: [USER_ROLE] })
    await page.goto('/summary')

    await verifyOnPage(page, RequestReportSummaryPage)
  })

  test('Results box exists', async ({ page }) => {
    await login(page, { roles: [USER_ROLE] })
    await page.goto('/summary')
    const summaryPage = await verifyOnPage(page, RequestReportSummaryPage)
    await expect(summaryPage.reportSummary).toBeVisible()
  })

  test('Accept and confirm button exists', async ({ page }) => {
    await login(page, { roles: [USER_ROLE] })
    await page.goto('/summary')
    const summaryPage = await verifyOnPage(page, RequestReportSummaryPage)

    await expect(summaryPage.acceptConfirmButton).toBeVisible()
  })

  test('Details summarised include subject ID', async ({ page }) => {
    await login(page, { roles: [USER_ROLE] })
    await page.goto('/summary')
    const summaryPage = await verifyOnPage(page, RequestReportSummaryPage)

    await expect(summaryPage.reportSummary).toContainText('Subject ID')
  })

  test('Details summarised include case ID', async ({ page }) => {
    await login(page, { roles: [USER_ROLE] })
    await page.goto('/summary')
    const summaryPage = await verifyOnPage(page, RequestReportSummaryPage)

    await expect(summaryPage.reportSummary).toContainText('Case ID')
  })

  test('Details summarised include date range', async ({ page }) => {
    await login(page, { roles: [USER_ROLE] })
    await page.goto('/summary')
    const summaryPage = await verifyOnPage(page, RequestReportSummaryPage)

    await expect(summaryPage.reportSummary).toContainText('Query date range')
  })

  test('Details summarised include selected products', async ({ page }) => {
    await login(page, { roles: [USER_ROLE] })
    await page.goto('/summary')
    const summaryPage = await verifyOnPage(page, RequestReportSummaryPage)

    await expect(summaryPage.reportSummary).toContainText('Products selected')
  })

  test('Subject ID can be edited at /subject-id', async ({ page }) => {
    await login(page, { roles: [USER_ROLE] })
    await page.goto('/summary')
    const summaryPage = await verifyOnPage(page, RequestReportSummaryPage)
    await summaryPage.changeSubjectId()

    const subjectIdPage = await verifyOnPage(page, RequestReportSubjectIdPage)
    expect(subjectIdPage.page.url()).toMatch(/subject-id$/)
  })

  test('Case ID can be edited at /inputs', async ({ page }) => {
    await login(page, { roles: [USER_ROLE] })
    await page.goto('/summary')
    const summaryPage = await verifyOnPage(page, RequestReportSummaryPage)
    await summaryPage.changeCaseId()

    const inputsPage = await verifyOnPage(page, RequestReportInputsPage)
    expect(inputsPage.page.url()).toMatch(/inputs$/)
  })

  test('Date range can be edited at /inputs', async ({ page }) => {
    await login(page, { roles: [USER_ROLE] })
    await page.goto('/summary')
    const summaryPage = await verifyOnPage(page, RequestReportSummaryPage)
    await summaryPage.changeDates()

    const inputsPage = await verifyOnPage(page, RequestReportInputsPage)
    expect(inputsPage.page.url()).toMatch(/inputs$/)
  })

  test('Selected products can be edited at /product-selection', async ({ page }) => {
    await login(page, { roles: [USER_ROLE] })
    await page.goto('/summary')
    const summaryPage = await verifyOnPage(page, RequestReportSummaryPage)
    await summaryPage.changeProducts()

    const productsPage = await verifyOnPage(page, RequestReportProductsPage)
    expect(productsPage.page.url()).toMatch(/product-selection$/)
  })

  test('Selected products are carried through from /product-selection', async ({ page }) => {
    const summaryPage = await requestReportSummary(page)

    await expect(summaryPage.reportSummary).toContainText('Service One')
    await expect(summaryPage.reportSummary).toContainText('Service Two')
  })

  test('Details are carried through from /inputs', async ({ page }) => {
    const inputsPage = await requestReportInputs(page)
    await inputsPage.inputDateFrom('01/01/2001')
    await inputsPage.inputDateTo('01/01/2021')
    await inputsPage.inputCaseReference('exampleCaseReference')
    await inputsPage.continue()
    const productsPage = await verifyOnPage(page, RequestReportProductsPage)
    await productsPage.selectAll()
    await productsPage.continue()
    const summaryPage = await verifyOnPage(page, RequestReportSummaryPage)

    await expect(summaryPage.reportSummary).toContainText('exampleCaseReference')
    await expect(summaryPage.reportSummary).toContainText('01/01/2001')
    await expect(summaryPage.reportSummary).toContainText('01/01/2021')
  })

  test('Subject ID is carried through from /subject-id', async ({ page }) => {
    const summaryPage = await requestReportSummary(page)

    await expect(summaryPage.reportSummary).toContainText('A1111AA')
  })

  test('Disclaimer text on page', async ({ page }) => {
    await login(page, { roles: [USER_ROLE] })
    await page.goto('/summary')
    await verifyOnPage(page, RequestReportSummaryPage)

    await expect(
      page.getByText(
        'By accepting these details you are confirming that, to the best of your knowledge, these details are correct.',
      ),
    ).toBeVisible()
  })

  test('Redirects to /summary if info not present', async ({ page }) => {
    await login(page, { roles: [USER_ROLE] })
    await page.goto('/summary')
    const summaryPage = await verifyOnPage(page, RequestReportSummaryPage)
    await summaryPage.continue()

    expect(summaryPage.page.url()).toMatch(/summary$/)
  })

  test.describe('when all answers have been completed in the session', () => {
    test('subject id directs back to /summary', async ({ page }) => {
      await requestReportSummary(page)
      await page.goto('/subject-id')
      const revisitedSubjectIdPage = await verifyOnPage(page, RequestReportSubjectIdPage)
      await revisitedSubjectIdPage.continue()

      await verifyOnPage(page, RequestReportSummaryPage)
    })

    test('inputs directs back to /summary', async ({ page }) => {
      await requestReportSummary(page)
      await page.goto('/inputs')
      const revisitedInputsPage = await verifyOnPage(page, RequestReportInputsPage)
      await revisitedInputsPage.continue()

      await verifyOnPage(page, RequestReportSummaryPage)
    })

    test('product selection directs back to /summary', async ({ page }) => {
      await requestReportSummary(page)
      await page.goto('/product-selection')
      const revisitedProductsPage = await verifyOnPage(page, RequestReportProductsPage)
      await revisitedProductsPage.continue()

      await verifyOnPage(page, RequestReportSummaryPage)
    })
  })

  test('Redirects to /confirmation on clicking submit button', async ({ page }) => {
    await sarApi.stubSubjectAccessRequest({ httpStatus: 201 })
    const summaryPage = await requestReportSummary(page)
    await Promise.all([page.waitForRequest(postReportDetailsRequest()), summaryPage.continue()])

    expect(summaryPage.page.url()).toMatch(/confirmation$/)
  })

  const postReportDetailsRequest = () => req =>
    req.method() === 'POST' && new URL(req.url()).pathname.endsWith('/summary')
})
