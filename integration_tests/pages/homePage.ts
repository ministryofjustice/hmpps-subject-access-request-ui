import { type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class HomePage extends AbstractPage {
  readonly sarActionCards: Locator

  readonly requestReportLink: Locator

  readonly viewReportsLink: Locator

  readonly adminLink: Locator

  readonly registerTemplateLink: Locator

  readonly errorSummaryBox: Locator

  readonly productsSuspendedAlertContent: Locator

  readonly suspendedProductsAlertList: Locator

  constructor(page: Page) {
    super(page, 'Subject Access Request Product')
    this.sarActionCards = this.page.locator('.sar-card-group')
    this.requestReportLink = this.page.locator('#request-a-report')
    this.viewReportsLink = this.page.locator('#view-reports')
    this.adminLink = this.page.locator('#admin')
    this.registerTemplateLink = this.page.locator('#register-template')
    this.errorSummaryBox = this.page.locator('.govuk-error-summary')
    this.productsSuspendedAlertContent = this.page.locator('.moj-alert__content')
    this.suspendedProductsAlertList = this.page.locator('#suspended-services-alert-list')
  }

  requestReport = () => this.requestReportLink.click()

  viewReports = () => this.viewReportsLink.click()

  admin = () => this.adminLink.click()

  registerTemplate = () => this.registerTemplateLink.click()
}
