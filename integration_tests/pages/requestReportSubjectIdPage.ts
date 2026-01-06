import { type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class RequestReportSubjectIdPage extends AbstractPage {
  readonly idInput: Locator

  readonly idHint: Locator

  readonly additionalInformation: Locator

  readonly backLink: Locator

  readonly confirmButton: Locator

  readonly errorSummary: Locator

  constructor(page: Page) {
    super(page, 'Enter a HMPPS ID for the subject')
    this.idInput = this.page.locator('#subject-id')
    this.idHint = this.page.locator('#subject-id-hint')
    this.additionalInformation = this.page.locator('#additional-information')
    this.backLink = this.page.locator('a', { hasText: 'Back' })
    this.confirmButton = this.page.locator('button', { hasText: 'Confirm' })
    this.errorSummary = this.page.locator('.govuk-error-summary', { hasText: 'There is a problem' })
  }

  inputSubjectId = async (value: string) => {
    await this.idInput.clear()
    await this.idInput.fill(value)
  }

  back = () => this.backLink.click()

  continue = () => this.confirmButton.click()
}
