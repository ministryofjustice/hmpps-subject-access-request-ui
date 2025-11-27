import { type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class RegisterTemplateResultPage extends AbstractPage {
  readonly serviceSummary: Locator

  readonly versionSummary: Locator

  readonly filehashSummary: Locator

  readonly statusSummary: Locator

  readonly continueButton: Locator

  constructor(page: Page) {
    super(page, 'New template version for ')
    this.serviceSummary = this.page.locator('div.govuk-summary-list__row', { hasText: 'Service' })
    this.versionSummary = this.page.locator('div.govuk-summary-list__row', { hasText: 'Version' })
    this.filehashSummary = this.page.locator('div.govuk-summary-list__row', { hasText: 'File hash' })
    this.statusSummary = this.page.locator('div.govuk-summary-list__row', { hasText: 'Status' })
    this.continueButton = this.page.locator('a', { hasText: 'Continue' })
  }

  continue = () => this.page.locator('a', { hasText: 'Continue' }).click()
}
