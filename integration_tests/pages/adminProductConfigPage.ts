import { Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class AdminProductConfigPage extends AbstractPage {
  readonly productsTable: Locator

  readonly createProductConfigButton: Locator

  constructor(page: Page) {
    super(page, 'Product Configurations')
    this.productsTable = this.page.locator('table.govuk-table', {
      has: this.page.locator('th', { hasText: 'Name' }),
    })
    this.createProductConfigButton = this.page.locator('a', { hasText: 'Create Product Configuration' })
  }

  productsTableRow = (rowIndex: number = 0): Locator => this.productsTable.locator('tbody tr').nth(rowIndex)

  productsTableCell = (rowIndex: number = 0, cellIndex: number = 0): Locator =>
    this.productsTableRow(rowIndex).locator('td').nth(cellIndex)

  createProductConfig = () => this.createProductConfigButton.click()

  selectProduct = (rowIndex: number = 0) => this.productsTableCell(rowIndex, 0).locator('a').click()
}
