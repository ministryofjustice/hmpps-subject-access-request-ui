import { type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class HomePage extends AbstractPage {
  readonly sarActionCards: Locator

  readonly requestReportLink: Locator

  readonly viewReportsLink: Locator

  readonly adminLink: Locator

  readonly registerTemplateLink: Locator

  constructor(page: Page) {
    super(page, 'Subject Access Request Service')
    this.sarActionCards = this.page.locator('.sar-card-group')
    this.requestReportLink = this.page.locator('#request-a-report')
    this.viewReportsLink = this.page.locator('#view-reports')
    this.adminLink = this.page.locator('#admin')
    this.registerTemplateLink = this.page.locator('#register-template')
  }

  requestReport = () => this.requestReportLink.click()

  viewReports = () => this.viewReportsLink.click()

  admin = () => this.adminLink.click()

  registerTemplate = () => this.registerTemplateLink.click()
}
