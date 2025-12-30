import { Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class AdminHealthPage extends AbstractPage {
  readonly documentStoreHealthTable: Locator

  readonly lookupServicesHealthTable: Locator

  readonly sarServicesHealthTable: Locator

  constructor(page: Page) {
    super(page, 'Health')
    this.documentStoreHealthTable = this.page.locator('table.govuk-table', {
      has: this.page.locator('caption', { hasText: 'Document store' }),
    })
    this.lookupServicesHealthTable = this.page.locator('table.govuk-table', {
      has: this.page.locator('caption', { hasText: 'Lookup services' }),
    })
    this.sarServicesHealthTable = this.page.locator('table.govuk-table', {
      has: this.page.locator('caption', { hasText: 'SAR services' }),
    })
  }

  documentStoreRow = (name: string): Locator =>
    this.documentStoreHealthTable
      .locator('tbody .govuk-table__row')
      .filter({ has: this.page.locator('td', { hasText: name }) })
      .first()

  lookupServicesRow = (name: string): Locator =>
    this.lookupServicesHealthTable
      .locator('tbody .govuk-table__row')
      .filter({ has: this.page.locator('td', { hasText: name }) })
      .first()

  sarServicesRow = (name: string): Locator =>
    this.sarServicesHealthTable
      .locator('tbody .govuk-table__row')
      .filter({ has: this.page.locator('td', { hasText: name }) })
      .first()
}
