import { type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class RequestReportInputsPage extends AbstractPage {
  readonly datePickerFrom: Locator

  readonly datePickerTo: Locator

  readonly caseReferenceTextbox: Locator

  readonly backLink: Locator

  readonly continueButton: Locator

  readonly errorSummary: Locator

  constructor(page: Page) {
    super(page, 'Enter details')
    this.datePickerFrom = this.page.locator('#input-dateFrom')
    this.datePickerTo = this.page.locator('#input-dateTo')
    this.caseReferenceTextbox = this.page.locator('#input-caseReference')
    this.backLink = this.page.locator('a', { hasText: 'Back' })
    this.continueButton = this.page.locator('button', { hasText: 'Confirm' })
    this.errorSummary = this.page.locator('.govuk-error-summary', { hasText: 'There is a problem' })
  }

  inputDateFrom = async (value: string) => {
    await this.datePickerFrom.clear()
    await this.datePickerFrom.fill(value)
  }

  inputDateTo = async (value: string) => {
    await this.datePickerTo.clear()
    await this.datePickerTo.fill(value)
  }

  inputCaseReference = async (value: string) => {
    await this.caseReferenceTextbox.clear()
    await this.caseReferenceTextbox.fill(value)
  }

  back = () => this.backLink.click()

  continue = () => this.continueButton.click()
}
