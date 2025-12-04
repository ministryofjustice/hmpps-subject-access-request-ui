import { type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class RegisterTemplateConfirmationPage extends AbstractPage {
  readonly productParagraph: Locator

  readonly filenameParagraph: Locator

  readonly confirmButton: Locator

  readonly cancelButton: Locator

  constructor(page: Page) {
    super(page, 'Are you sure you want to register this template?')
    this.productParagraph = this.page.locator('p', { hasText: 'Product name:' })
    this.filenameParagraph = this.page.locator('p', { hasText: 'Template file name:' })
    this.confirmButton = this.page.locator('button', { hasText: 'Confirm' })
    this.cancelButton = this.page.locator('a', { hasText: 'Cancel' })
  }

  confirm = () => this.confirmButton.click()

  cancel = () => this.cancelButton.click()
}
