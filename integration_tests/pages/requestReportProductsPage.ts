import { type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class RequestReportProductsPage extends AbstractPage {
  readonly checkAllCheckBox: Locator

  readonly checkAllLabel: Locator

  readonly backLink: Locator

  readonly confirmButton: Locator

  readonly errorSummary: Locator

  constructor(page: Page) {
    super(page, 'Select Products')
    this.checkAllCheckBox = this.page.locator('#checkboxes-all')
    this.checkAllLabel = this.page.getByLabel('Select all')
    this.backLink = this.page.locator('a', { hasText: 'Back' })
    this.confirmButton = this.page.locator('button', { hasText: 'Confirm' })
    this.errorSummary = this.page.locator('.govuk-error-summary', { hasText: 'There is a problem' })
  }

  selectAll = () => this.checkAllCheckBox.click({ force: true })

  serviceCheckbox = (service: string) => this.page.locator(`#${service}`)

  selectService = (service: string) => this.serviceCheckbox(service).click({ force: true })

  back = () => this.backLink.click()

  continue = () => this.confirmButton.click()
}
