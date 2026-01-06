import { expect, test, Request } from '@playwright/test'
import hmppsAuth from '../mockApis/hmppsAuth'

import { USER_ROLE, login, resetStubs, verifyOnPage, requestReportSubjectId } from '../testUtils'
import AuthSignInPage from '../pages/authSignInPage'
import AuthErrorPage from '../pages/authErrorPage'
import RequestReportSubjectIdPage from '../pages/requestReportSubjectIdPage'
import RequestReportInputsPage from '../pages/requestReportInputsPage'
import HomePage from '../pages/homePage'

test.describe('Request Report - SubjectId', () => {
  test.beforeEach(async () => {})

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Redirects to auth if requested by unauthenticated user', async ({ page }) => {
    await hmppsAuth.stubSignInPage()
    await page.goto('/subject-id')

    await verifyOnPage(page, AuthSignInPage)
  })

  test('Redirects to authError if requested by user without appropriate role', async ({ page }) => {
    await login(page, { roles: ['ROLE_OTHER'] })
    await page.goto('/subject-id')

    await verifyOnPage(page, AuthErrorPage)
  })

  test('Renders for authenticated users', async ({ page }) => {
    await login(page, { roles: [USER_ROLE] })
    await page.goto('/subject-id')

    await verifyOnPage(page, RequestReportSubjectIdPage)
  })

  test('Displays all necessary components', async ({ page }) => {
    const subjectIdPage = await requestReportSubjectId(page)

    await expect(subjectIdPage.idHint).toBeVisible()
    await expect(subjectIdPage.idInput).toBeVisible()
    await expect(subjectIdPage.additionalInformation).toBeVisible()
    await expect(subjectIdPage.confirmButton).toBeVisible()
  })

  test('Submits valid subject id user input and redirects to /inputs', async ({ page }) => {
    const subjectIdPage = await requestReportSubjectId(page)
    await subjectIdPage.inputSubjectId('A1111AA')
    const [request] = await Promise.all([page.waitForRequest(saveSubjectIdRequest()), subjectIdPage.continue()])
    const body = request.postData()

    expect(body).toContain('subjectId=A1111AA')
    expect(subjectIdPage.page.url()).toMatch(/inputs$/)
  })

  test('Persists user inputs when returning to page', async ({ page }) => {
    let subjectIdPage = await requestReportSubjectId(page)
    await subjectIdPage.inputSubjectId('A1111AA')
    await subjectIdPage.continue()

    await verifyOnPage(page, RequestReportInputsPage)
    await page.goto('/subject-id')
    subjectIdPage = await verifyOnPage(page, RequestReportSubjectIdPage)
    await expect(subjectIdPage.idInput).toHaveValue('A1111AA')
  })

  test('Does not allow subject ID to be empty', async ({ page }) => {
    let subjectIdPage = await requestReportSubjectId(page)
    await Promise.all([page.waitForRequest(saveSubjectIdRequest()), subjectIdPage.continue()])

    expect(subjectIdPage.page.url()).toMatch(/subject-id$/)
    subjectIdPage = await verifyOnPage(page, RequestReportSubjectIdPage)
    await expect(subjectIdPage.errorSummary).toBeVisible()
    await expect(subjectIdPage.errorSummary).toContainText('Enter subject ID')
  })

  test('Does not allow invalid input', async ({ page }) => {
    const invalidSubjectId = 'not-a-nomis-or-ndelius-id'
    let subjectIdPage = await requestReportSubjectId(page)
    await subjectIdPage.inputSubjectId(invalidSubjectId)
    await Promise.all([page.waitForRequest(saveSubjectIdRequest()), subjectIdPage.continue()])

    expect(subjectIdPage.page.url()).toMatch(/subject-id$/)
    subjectIdPage = await verifyOnPage(page, RequestReportSubjectIdPage)
    await expect(subjectIdPage.errorSummary).toBeVisible()
    await expect(subjectIdPage.errorSummary).toContainText(
      'Subject ID must be a NOMIS prisoner number or nDelius case reference number',
    )
  })

  test('redirects to homepage when back link is clicked', async ({ page }) => {
    const subjectIdPage = await requestReportSubjectId(page)
    await subjectIdPage.back()

    await verifyOnPage(page, HomePage)
  })

  const saveSubjectIdRequest = () => (req: Request) =>
    req.method() === 'POST' && new URL(req.url()).pathname.endsWith('/subject-id')
})
