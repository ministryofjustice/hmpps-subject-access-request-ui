import { Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class AdminProductConfigPage extends AbstractPage {
  readonly productsTable: Locator

  constructor(page: Page) {
    super(page, 'Product Configuration')
    this.productsTable = this.page.locator('table.govuk-table', {
      has: this.page.locator('th', { hasText: 'Name' }),
    })
  }

  productsTableRow = (rowIndex: number = 0): Locator => this.productsTable.locator('tbody tr').nth(rowIndex)

  productsTableCell = (rowIndex: number = 0, cellIndex: number = 0): Locator =>
    this.productsTableRow(rowIndex).locator('td').nth(cellIndex)
}
