import { type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class RegisterTemplateServicePage extends AbstractPage {
  readonly backLink: Locator

  readonly selectServiceInput: Locator

  readonly serviceInputError: Locator

  readonly continueButton: Locator

  readonly errorSummary: Locator

  constructor(page: Page) {
    super(page, 'Select Service')
    this.backLink = this.page.locator('a', { hasText: 'Back' })
    this.selectServiceInput = this.page.locator('#service')
    this.serviceInputError = this.page.locator('#service-error')
    this.continueButton = this.page.locator('button', { hasText: 'Continue' })
    this.errorSummary = this.page.locator('.govuk-error-summary', { hasText: 'There is a problem' })
  }

  back = () => this.backLink.click()

  selectService = (serviceId: string) => this.selectServiceInput.selectOption(serviceId)

  continue = () => this.continueButton.click()
}
