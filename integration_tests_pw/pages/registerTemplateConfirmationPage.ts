import { type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class RegisterTemplateConfirmationPage extends AbstractPage {
  readonly serviceParagraph: Locator

  readonly filenameParagraph: Locator

  readonly confirmButton: Locator

  readonly cancelButton: Locator

  constructor(page: Page) {
    super(page, 'Are you sure you want to register?')
    this.serviceParagraph = this.page.locator('p', { hasText: 'Service:' })
    this.filenameParagraph = this.page.locator('p', { hasText: 'Filename:' })
    this.confirmButton = this.page.locator('button', { hasText: 'Confirm' })
    this.cancelButton = this.page.locator('a', { hasText: 'Cancel' })
  }

  confirm = () => this.confirmButton.click()

  cancel = () => this.cancelButton.click()
}
