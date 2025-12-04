import { expect, test } from '@playwright/test'
import hmppsAuth from '../mockApis/hmppsAuth'
import { login, requestReportInputs, resetStubs, USER_ROLE, verifyOnPage } from '../testUtils'
import AuthSignInPage from '../pages/authSignInPage'
import AuthErrorPage from '../pages/authErrorPage'
import RequestReportInputsPage from '../pages/requestReportInputsPage'
import RequestReportSubjectIdPage from '../pages/requestReportSubjectIdPage'

test.describe('Request report inputs', () => {
  test.beforeEach(async () => {})

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Redirects to auth if requested by unauthenticated user', async ({ page }) => {
    await hmppsAuth.stubSignInPage()
    await page.goto('/inputs')

    await verifyOnPage(page, AuthSignInPage)
  })

  test('Redirects to authError if requested by user without appropriate role', async ({ page }) => {
    await login(page, { roles: ['ROLE_OTHER'] })
    await page.goto('/inputs')

    await verifyOnPage(page, AuthErrorPage)
  })

  test('Renders for authenticated users', async ({ page }) => {
    await login(page, { roles: [USER_ROLE] })
    await page.goto('/inputs')

    const inputsPage = await verifyOnPage(page, RequestReportInputsPage)

    await expect(inputsPage.datePickerFrom).toBeVisible()
    await expect(inputsPage.datePickerFrom).toHaveValue('')
    await expect(inputsPage.datePickerTo).toBeVisible()
    await expect(inputsPage.datePickerTo).toHaveValue(new Date().toLocaleDateString('en-gb', { dateStyle: 'short' }))
    await expect(inputsPage.caseReferenceTextbox).toBeVisible()
    await expect(inputsPage.caseReferenceTextbox).toHaveValue('')
    await expect(inputsPage.continueButton).toBeVisible()
    await expect(inputsPage.errorSummary).not.toBeVisible()
  })

  test('Submits user inputs and redirects to /product-selection', async ({ page }) => {
    await requestReportInputs(page)
    const inputsPage = await verifyOnPage(page, RequestReportInputsPage)

    await inputsPage.inputDateFrom('01/01/2001')
    await inputsPage.inputDateTo('01/01/2021')
    await inputsPage.inputCaseReference('exampleCaseReference')
    const [request] = await Promise.all([
      page.waitForRequest(req => req.method() === 'POST' && req.url().includes('/inputs')),
      await inputsPage.continue(),
    ])
    const requestBody = request.postData()

    expect(requestBody).toContain('dateFrom=')
    expect(requestBody).toContain('dateTo=')
    expect(requestBody).toContain('caseReference=')
    expect(inputsPage.page.url()).toMatch(/product-selection$/)
  })

  test('Persists user inputs when returning to inputs page', async ({ page }) => {
    await requestReportInputs(page)
    let inputsPage = await verifyOnPage(page, RequestReportInputsPage)
    await inputsPage.inputDateFrom('01/01/2001')
    await inputsPage.inputDateTo('01/01/2021')
    await inputsPage.inputCaseReference('exampleCaseReference')
    await inputsPage.continue()

    await page.goto('/inputs')

    inputsPage = await verifyOnPage(page, RequestReportInputsPage)
    await expect(inputsPage.datePickerFrom).toHaveValue('01/01/2001')
    await expect(inputsPage.datePickerTo).toHaveValue('01/01/2021')
    await expect(inputsPage.caseReferenceTextbox).toHaveValue('exampleCaseReference')
  })

  test.describe('Does not allow any invalid dateFrom input', () => {
    const invalidInputs = [
      '01/01/2150', // Future date (Greater than current year)
      '01/13/2022', // Invalid month (Greater than 12)
      '32/01/2022', // Invalid day (Greater than 31)
      '30/02/2023', // Invalid day (30 in February)
      'a/01/2022', // Invalid day (not numeric)
      '01/a/2022', // Invalid month (not numeric)
      '01/01/a', // Invalid year (not numeric)
      'test', // Invalid date
    ]
    invalidInputs.forEach(inputValue => {
      test(`dateFrom value of ${inputValue} shows error`, async ({ page }) => {
        let inputsPage = await requestReportInputs(page)
        await inputsPage.inputDateFrom(inputValue)
        await inputsPage.inputDateTo('01/01/2021')
        await inputsPage.inputCaseReference('exampleCaseReference')
        await inputsPage.continue()

        inputsPage = await verifyOnPage(page, RequestReportInputsPage)
        await expect(inputsPage.datePickerFrom).toHaveValue(inputValue)
        await expect(inputsPage.datePickerTo).toHaveValue('01/01/2021')
        await expect(inputsPage.caseReferenceTextbox).toHaveValue('exampleCaseReference')
        await expect(inputsPage.errorSummary).toBeVisible()
      })
    })
  })

  test.describe('Does not allow any invalid dateTo input', () => {
    const invalidInputs = [
      '01/01/2150', // Future date (Greater than current year)
      '01/13/2022', // Invalid month (Greater than 12)
      '32/01/2022', // Invalid day (Greater than 31)
      '30/02/2023', // Invalid day (30 in February)
      'a/01/2022', // Invalid day (not numeric)
      '01/a/2022', // Invalid month (not numeric)
      '01/01/a', // Invalid year (not numeric)
      'test', // Invalid date
    ]
    invalidInputs.forEach(inputValue => {
      test(`dateTo value of ${inputValue} shows error`, async ({ page }) => {
        let inputsPage = await requestReportInputs(page)
        await inputsPage.inputDateFrom('01/01/2001')
        await inputsPage.inputDateTo(inputValue)
        await inputsPage.inputCaseReference('exampleCaseReference')
        await inputsPage.continue()

        inputsPage = await verifyOnPage(page, RequestReportInputsPage)
        await expect(inputsPage.datePickerFrom).toHaveValue('01/01/2001')
        await expect(inputsPage.datePickerTo).toHaveValue(inputValue)
        await expect(inputsPage.caseReferenceTextbox).toHaveValue('exampleCaseReference')
        await expect(inputsPage.errorSummary).toBeVisible()
      })
    })
  })

  test('Does not allow empty dateTo input', async ({ page }) => {
    let inputsPage = await requestReportInputs(page)
    await inputsPage.inputDateFrom('01/01/2001')
    await inputsPage.inputDateTo('')
    await inputsPage.inputCaseReference('exampleCaseReference')
    await inputsPage.continue()

    inputsPage = await verifyOnPage(page, RequestReportInputsPage)
    await expect(inputsPage.datePickerFrom).toHaveValue('01/01/2001')
    await expect(inputsPage.datePickerTo).toHaveValue(new Date().toLocaleDateString('en-GB'))
    await expect(inputsPage.caseReferenceTextbox).toHaveValue('exampleCaseReference')
    await expect(inputsPage.errorSummary).toBeVisible()
  })

  test.describe('Does not allow any invalid caseReference input', () => {
    const invalidInputs = [
      'abcdefghijklmnopqrstuvwxyz', // Invalid string (Longer than 20 chars)
      '', // Empty value
    ]
    invalidInputs.forEach(inputValue => {
      test(`caseReference value of ${inputValue} shows error`, async ({ page }) => {
        let inputsPage = await requestReportInputs(page)
        await inputsPage.inputDateFrom('01/01/2001')
        await inputsPage.inputDateTo('01/01/2021')
        await inputsPage.inputCaseReference(inputValue)
        await inputsPage.continue()

        inputsPage = await verifyOnPage(page, RequestReportInputsPage)
        await expect(inputsPage.datePickerFrom).toHaveValue('01/01/2001')
        await expect(inputsPage.datePickerTo).toHaveValue('01/01/2021')
        await expect(inputsPage.caseReferenceTextbox).toHaveValue(inputValue)
        await expect(inputsPage.errorSummary).toBeVisible()
      })
    })
  })

  test('Does not allow DateFrom to be after DateTo', async ({ page }) => {
    let inputsPage = await requestReportInputs(page)
    await inputsPage.inputDateFrom('01/01/2021')
    await inputsPage.inputDateTo('01/01/2001')
    await inputsPage.inputCaseReference('exampleCaseReference')
    await inputsPage.continue()

    inputsPage = await verifyOnPage(page, RequestReportInputsPage)
    await expect(inputsPage.datePickerFrom).toHaveValue('01/01/2021')
    await expect(inputsPage.datePickerTo).toHaveValue('01/01/2001')
    await expect(inputsPage.caseReferenceTextbox).toHaveValue('exampleCaseReference')
    await expect(inputsPage.errorSummary).toBeVisible()
  })

  test('Redirects to subject ID page when back link is clicked', async ({ page }) => {
    const inputsPage = await requestReportInputs(page)

    await inputsPage.back()

    const subjectIdPage = await verifyOnPage(page, RequestReportSubjectIdPage)
    expect(subjectIdPage.page.url()).toMatch(/subject-id$/)
  })
})
