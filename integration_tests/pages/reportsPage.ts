import { Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class ReportsPage extends AbstractPage {
  readonly reportsTable: Locator

  readonly sortByDateButton: Locator

  readonly searchBox: Locator

  readonly searchButton: Locator

  constructor(page: Page) {
    super(page, 'Subject Access Request Reports')
    this.reportsTable = this.page.locator('.govuk-table')
    this.sortByDateButton = this.page.locator('button', { hasText: 'Date of request' })
    this.searchBox = this.page.locator('#keyword')
    this.searchButton = this.page.locator('button', { hasText: 'Search' })
  }

  reportsTableRow = (rowIndex: number = 0): Locator => this.reportsTable.locator('tbody tr').nth(rowIndex)

  sortByDate = () => this.sortByDateButton.click()

  searchFor = async (searchText: string) => {
    await this.searchBox.clear()
    await this.searchBox.fill(searchText)
    await this.searchButton.click()
  }
}
