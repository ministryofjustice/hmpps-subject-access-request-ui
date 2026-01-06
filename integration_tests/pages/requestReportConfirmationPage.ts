import { Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class RequestReportConfirmationPage extends AbstractPage {
  readonly confirmationPanel: Locator

  readonly nextSteps: Locator

  readonly viewReportsLink: Locator

  constructor(page: Page) {
    super(page, 'Your report request for')
    this.confirmationPanel = this.page.locator('#confirmation-panel')
    this.nextSteps = this.page.locator('#next-steps')
    this.viewReportsLink = this.page.locator('a', { hasText: 'View all reports' })
  }

  viewReports = () => this.viewReportsLink.click()
}
