import { type Locator, type Page } from '@playwright/test'
import path from 'node:path'
import AbstractPage from './abstractPage'

export default class RegisterTemplateUploadPage extends AbstractPage {
  readonly backLink: Locator

  readonly versionTable: Locator

  readonly templateFileInput: Locator

  readonly templateFileInputError: Locator

  readonly continueButton: Locator

  readonly warningAlert: Locator

  readonly notificationBanner: Locator

  readonly errorSummary: Locator

  constructor(page: Page) {
    super(page, 'Upload template for ')
    this.backLink = this.page.locator('a', { hasText: 'Back' })
    this.versionTable = this.page.locator('table', {
      hasText: 'Latest registered template (including Pending if exists)',
    })
    this.templateFileInput = this.page.locator('#template-input')
    this.templateFileInputError = this.page.locator('#template-error')
    this.continueButton = this.page.locator('button', { hasText: 'Continue' })
    this.warningAlert = this.page.locator('.moj-alert--warning')
    this.notificationBanner = this.page.locator('.govuk-notification-banner', { hasText: 'Important' })
    this.errorSummary = this.page.locator('.govuk-error-summary', { hasText: 'There is a problem' })
  }

  back = () => this.backLink.click()

  selectTemplateFile = (filename: string) =>
    this.templateFileInput.setInputFiles(path.resolve(__dirname, `../files/${filename}`))

  continue = () => this.continueButton.click()
}
