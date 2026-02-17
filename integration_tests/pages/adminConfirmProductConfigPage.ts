import { Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class AdminConfirmProductConfigPage extends AbstractPage {
  readonly productConfigSummary: Locator

  readonly changeNameLink: Locator

  readonly changeLabelLink: Locator

  readonly changeUrlLink: Locator

  readonly changeCategoryLink: Locator

  readonly changeEnabledLink: Locator

  readonly changeMigratedLink: Locator

  readonly backLink: Locator

  readonly acceptButton: Locator

  readonly cancelButton: Locator

  readonly errorSummary: Locator

  constructor(page: Page) {
    super(page, 'Confirm Product Configuration Details')
    this.productConfigSummary = this.page.locator('#product-config-summary')
    this.changeNameLink = this.page.locator('#change-name')
    this.changeLabelLink = this.page.locator('#change-label')
    this.changeUrlLink = this.page.locator('#change-url')
    this.changeCategoryLink = this.page.locator('#change-category')
    this.changeEnabledLink = this.page.locator('#change-enabled')
    this.changeMigratedLink = this.page.locator('#change-template-migrated')
    this.backLink = this.page.locator('a', { hasText: 'Back' })
    this.acceptButton = this.page.locator('button', { hasText: 'Accept and create' })
    this.cancelButton = this.page.locator('a', { hasText: 'Cancel' })
    this.errorSummary = this.page.locator('.govuk-error-summary', { hasText: 'There is a problem' })
  }

  changeName = () => this.changeNameLink.click()

  changeLabel = () => this.changeLabelLink.click()

  changeUrl = () => this.changeUrlLink.click()

  changeCategory = () => this.changeCategoryLink.click()

  changeEnabled = () => this.changeEnabledLink.click()

  changeMigrated = () => this.changeMigratedLink.click()

  back = () => this.backLink.click()

  accept = () => this.acceptButton.click()

  cancel = () => this.cancelButton.click()
}
