import { Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class AdminReportsPage extends AbstractPage {
  readonly countTable: Locator

  readonly reportsTable: Locator

  readonly sortByDateButton: Locator

  readonly searchBox: Locator

  readonly searchButton: Locator

  readonly completedFilterCheckbox: Locator

  readonly erroredFilterCheckbox: Locator

  readonly overdueFilterCheckbox: Locator

  readonly pendingFilterCheckbox: Locator

  constructor(page: Page) {
    super(page, 'Reports Admin')
    this.countTable = this.page.locator('table.govuk-table', {
      has: this.page.locator('caption', { hasText: 'Reports count' }),
    })
    this.reportsTable = this.page.locator('table.govuk-table', {
      has: this.page.locator('th', { hasText: 'Date of request' }),
    })
    this.sortByDateButton = this.page.locator('button', { hasText: 'Date of request' })
    this.searchBox = this.page.locator('#keyword')
    this.searchButton = this.page.locator('button', { hasText: 'Search' })
    this.completedFilterCheckbox = this.page
      .locator('.govuk-checkboxes__item', { hasText: 'Completed' })
      .locator('input')
    this.erroredFilterCheckbox = this.page.locator('.govuk-checkboxes__item', { hasText: 'Errored' }).locator('input')
    this.overdueFilterCheckbox = this.page.locator('.govuk-checkboxes__item', { hasText: 'Overdue' }).locator('input')
    this.pendingFilterCheckbox = this.page.locator('.govuk-checkboxes__item', { hasText: 'Pending' }).locator('input')
  }

  countTableCell = (index: number): Locator => this.countTable.locator('td').nth(index)

  reportsTableRow = (rowIndex: number = 0): Locator => this.reportsTable.locator('tbody tr').nth(rowIndex)

  followReportsDetailsLink = (rowIndex: number = 0) =>
    this.reportsTableRow(rowIndex).locator('a', { hasText: 'View details' }).click()

  search = () => this.searchButton.click()
}
