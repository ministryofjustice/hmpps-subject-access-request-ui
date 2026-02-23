import { Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default abstract class AdminProductConfigInputPage extends AbstractPage {
  readonly nameTextbox: Locator

  readonly labelTextbox: Locator

  readonly urlTextbox: Locator

  readonly prisonCategoryRadio: Locator

  readonly probationCategoryRadio: Locator

  readonly enabledCheckbox: Locator

  readonly migratedCheckbox: Locator

  readonly backLink: Locator

  readonly continueButton: Locator

  readonly errorSummary: Locator

  constructor(page: Page, title: string) {
    super(page, title)
    this.nameTextbox = this.page.getByLabel('Name')
    this.labelTextbox = this.page.getByLabel('Label')
    this.urlTextbox = this.page.getByLabel('Url')
    this.prisonCategoryRadio = this.page.getByRole('radio', { name: 'Prison' })
    this.probationCategoryRadio = this.page.getByRole('radio', { name: 'Probation' })
    this.enabledCheckbox = this.page.getByRole('checkbox', { name: 'Enabled' })
    this.migratedCheckbox = this.page.getByRole('checkbox', { name: 'Template migrated' })
    this.backLink = this.page.locator('a', { hasText: 'Back' })
    this.continueButton = this.page.locator('button', { hasText: 'Continue' })
    this.errorSummary = this.page.locator('.govuk-error-summary', { hasText: 'There is a problem' })
  }

  inputName = async (value: string) => {
    await this.nameTextbox.clear()
    await this.nameTextbox.fill(value)
  }

  inputLabel = async (value: string) => {
    await this.labelTextbox.clear()
    await this.labelTextbox.fill(value)
  }

  inputUrl = async (value: string) => {
    await this.urlTextbox.clear()
    await this.urlTextbox.fill(value)
  }

  back = () => this.backLink.click()

  continue = () => this.continueButton.click()
}
