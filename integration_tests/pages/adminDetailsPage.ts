import { Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class AdminDetailsPage extends AbstractPage {
  readonly idSummaryRow: Locator

  readonly subjectIdSummaryRow: Locator

  readonly caseIdSummaryRow: Locator

  readonly queryDateFromSummaryRow: Locator

  readonly queryDateToSummaryRow: Locator

  readonly reqBySummaryRow: Locator

  readonly reqDateTimeSummaryRow: Locator

  readonly productsSummaryRow: Locator

  readonly statusSummaryRow: Locator

  readonly claimDateTimeSummaryRow: Locator

  readonly claimAttemptsSummaryRow: Locator

  readonly lastDownloadedSummaryRow: Locator

  readonly restartButton: Locator

  readonly backLink: Locator

  readonly successPanel: Locator

  readonly errorSummary: Locator

  constructor(page: Page) {
    super(page, 'Subject Access Request Details')
    this.idSummaryRow = this.page.locator('.govuk-summary-list__row', { hasText: 'ID' }).first()
    this.subjectIdSummaryRow = this.page.locator('.govuk-summary-list__row', { hasText: 'Subject ID' })
    this.caseIdSummaryRow = this.page.locator('.govuk-summary-list__row', { hasText: 'Case ID' })
    this.queryDateFromSummaryRow = this.page.locator('.govuk-summary-list__row', { hasText: 'Query date from' })
    this.queryDateToSummaryRow = this.page.locator('.govuk-summary-list__row', { hasText: 'Query date to' })
    this.reqBySummaryRow = this.page.locator('.govuk-summary-list__row', { hasText: 'Requested by' })
    this.reqDateTimeSummaryRow = this.page.locator('.govuk-summary-list__row', { hasText: 'Requested date time' })
    this.productsSummaryRow = this.page.locator('.govuk-summary-list__row', { hasText: 'Products selected' })
    this.statusSummaryRow = this.page.locator('.govuk-summary-list__row', { hasText: 'Status' })
    this.claimDateTimeSummaryRow = this.page.locator('.govuk-summary-list__row', { hasText: 'Claim date time' })
    this.claimAttemptsSummaryRow = this.page.locator('.govuk-summary-list__row', { hasText: 'Claim attempts' })
    this.lastDownloadedSummaryRow = this.page.locator('.govuk-summary-list__row', { hasText: 'Last downloaded' })
    this.restartButton = this.page.locator('button', { hasText: 'Restart' })
    this.backLink = this.page.locator('a', { hasText: 'Back' })
    this.successPanel = this.page.locator('.govuk-panel', { hasText: 'Request restarted successfully' })
    this.errorSummary = this.page.locator('.govuk-error-summary', {
      hasText: 'There was a problem restarting the subject access request',
    })
  }

  back = () => this.backLink.click()

  restart = () => this.restartButton.click()
}
