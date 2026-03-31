import { Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class ReportDetailsPage extends AbstractPage {
  readonly subjectIdSummaryRow: Locator

  readonly caseIdSummaryRow: Locator

  readonly queryDateFromSummaryRow: Locator

  readonly queryDateToSummaryRow: Locator

  readonly reqBySummaryRow: Locator

  readonly reqDateTimeSummaryRow: Locator

  readonly productsSummaryRow: Locator

  readonly statusSummaryRow: Locator

  readonly lastDownloadedSummaryRow: Locator

  readonly suspendedProductsAlert: Locator

  readonly suspendedProductsAlertList: Locator

  readonly backLink: Locator

  constructor(page: Page) {
    super(page, 'Subject Access Request Details')
    this.subjectIdSummaryRow = this.page.locator('.govuk-summary-list__row', { hasText: 'Subject ID' })
    this.caseIdSummaryRow = this.page.locator('.govuk-summary-list__row', { hasText: 'Case reference number' })
    this.queryDateFromSummaryRow = this.page.locator('.govuk-summary-list__row', { hasText: 'Date from' })
    this.queryDateToSummaryRow = this.page.locator('.govuk-summary-list__row', { hasText: 'Date to' })
    this.reqBySummaryRow = this.page.locator('.govuk-summary-list__row', { hasText: 'Requested by' })
    this.reqDateTimeSummaryRow = this.page.locator('.govuk-summary-list__row', { hasText: 'Requested date/time' })
    this.productsSummaryRow = this.page.locator('.govuk-summary-list__row', { hasText: 'Products selected' })
    this.statusSummaryRow = this.page.locator('.govuk-summary-list__row', { hasText: 'Status' })
    this.lastDownloadedSummaryRow = this.page.locator('.govuk-summary-list__row', { hasText: 'Last downloaded' })
    this.suspendedProductsAlert = this.page.locator('.moj-alert__heading')
    this.suspendedProductsAlertList = this.page.locator('#suspended-services-alert-list')
    this.backLink = this.page.locator('a', { hasText: 'Back' })
  }

  back = () => this.backLink.click()

  selectedProductItem = (rowIndex: number = 0): Locator => this.productsSummaryRow.locator('tbody tr').nth(rowIndex)

  selectedProductItemStatus = (rowIndex: number = 0): Locator =>
    this.selectedProductItem(rowIndex).locator('.moj-badge')
}
