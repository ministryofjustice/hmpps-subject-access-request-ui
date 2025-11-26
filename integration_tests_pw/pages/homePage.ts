import { type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class HomePage extends AbstractPage {
  readonly sarActionCards: Locator = this.page.locator('.sar-card-group')

  readonly requestReportLink: Locator = this.page.locator('#request-a-report')

  readonly viewReportsLink: Locator = this.page.locator('#view-reports')

  readonly adminLink: Locator = this.page.locator('#admin')

  readonly registerTemplateLink: Locator = this.page.locator('#register-template')

  constructor(page: Page) {
    super(page, 'Subject Access Request Service')
  }

  requestReport = () => this.requestReportLink.click()

  viewReports = () => this.viewReportsLink.click()

  admin = () => this.adminLink.click()

  registerTemplate = () => this.registerTemplateLink.click()
}
