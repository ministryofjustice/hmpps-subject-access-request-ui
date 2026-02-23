import { Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class AdminConfirmProductConfigPage extends AbstractPage {
  readonly productConfigSummary: Locator

  readonly changeLink: Locator

  readonly backLink: Locator

  readonly createButton: Locator

  readonly updateButton: Locator

  readonly cancelButton: Locator

  readonly warningAlert: Locator

  readonly errorSummary: Locator

  constructor(page: Page) {
    super(page, 'Confirm Product Configuration Details')
    this.productConfigSummary = this.page.locator('#product-config-summary')
    this.changeLink = this.page.locator('#change-details')
    this.backLink = this.page.locator('a', { hasText: 'Back' })
    this.createButton = this.page.locator('button', { hasText: 'Accept and create' })
    this.updateButton = this.page.locator('button', { hasText: 'Accept and update' })
    this.cancelButton = this.page.locator('a', { hasText: 'Cancel' })
    this.warningAlert = this.page.locator('.moj-alert--warning')
    this.errorSummary = this.page.locator('.govuk-error-summary', { hasText: 'Problem' })
  }

  change = () => this.changeLink.click()

  back = () => this.backLink.click()

  create = () => this.createButton.click()

  update = () => this.updateButton.click()

  cancel = () => this.cancelButton.click()
}
