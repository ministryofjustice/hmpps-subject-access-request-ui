import { Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class AdminProductConfigDetailsPage extends AbstractPage {
  readonly productConfigSummary: Locator

  readonly editLink: Locator

  readonly backLink: Locator

  readonly errorSummary: Locator

  constructor(page: Page) {
    super(page, 'Product Configuration Details')
    this.productConfigSummary = this.page.locator('#product-config-summary')
    this.editLink = this.page.locator('#edit-details')
    this.backLink = this.page.locator('a', { hasText: 'Back' })
    this.errorSummary = this.page.locator('.govuk-error-summary', {
      hasText: 'Problem retrieving product configuration',
    })
  }

  edit = () => this.editLink.click()

  back = () => this.backLink.click()
}
