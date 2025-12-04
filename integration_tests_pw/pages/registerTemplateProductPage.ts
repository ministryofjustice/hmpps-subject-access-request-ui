import { type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class RegisterTemplateProductPage extends AbstractPage {
  readonly backLink: Locator

  readonly selectProductInput: Locator

  readonly productInputError: Locator

  readonly continueButton: Locator

  readonly errorSummary: Locator

  constructor(page: Page) {
    super(page, 'Select Product')
    this.backLink = this.page.locator('a', { hasText: 'Back' })
    this.selectProductInput = this.page.locator('#product')
    this.productInputError = this.page.locator('#product-error')
    this.continueButton = this.page.locator('button', { hasText: 'Continue' })
    this.errorSummary = this.page.locator('.govuk-error-summary', { hasText: 'There is a problem' })
  }

  back = () => this.backLink.click()

  selectProduct = (productId: string) => this.selectProductInput.selectOption(productId)

  continue = () => this.continueButton.click()
}
