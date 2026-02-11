import { type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class AdminPage extends AbstractPage {
  readonly healthLink: Locator

  readonly reportsLink: Locator

  readonly productConfigLink: Locator

  constructor(page: Page) {
    super(page, 'Subject Access Request Admin')
    this.healthLink = this.page.locator('a', { hasText: 'Health' })
    this.reportsLink = this.page.locator('a', { hasText: 'SAR reports' })
    this.productConfigLink = this.page.locator('a', { hasText: 'Product Configuration' })
  }

  clickHealthLink = () => this.healthLink.click()

  clickReportsLink = () => this.reportsLink.click()

  clickProductConfigLink = () => this.productConfigLink.click()
}
