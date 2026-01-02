import { type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class RequestReportSummaryPage extends AbstractPage {
  readonly acceptConfirmButton: Locator

  readonly reportSummary: Locator

  readonly changeSubjectIdLink: Locator

  readonly changeCaseIdLink: Locator

  readonly changeDatesLink: Locator

  readonly changeProductsLink: Locator

  constructor(page: Page) {
    super(page, 'Please confirm report details')
    this.acceptConfirmButton = this.page.locator('button', { hasText: 'Accept and create report' })
    this.reportSummary = this.page.locator('#report-summary')
    this.changeSubjectIdLink = this.page.locator('#change-subject-id')
    this.changeCaseIdLink = this.page.locator('#change-case-id')
    this.changeDatesLink = this.page.locator('#change-date-range')
    this.changeProductsLink = this.page.locator('#change-products')
  }

  continue = () => this.acceptConfirmButton.click()

  changeSubjectId = () => this.changeSubjectIdLink.click()

  changeCaseId = () => this.changeCaseIdLink.click()

  changeDates = () => this.changeDatesLink.click()

  changeProducts = () => this.changeProductsLink.click()
}
