import { type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class AdminPage extends AbstractPage {
  readonly healthLink: Locator

  readonly reportsLink: Locator

  constructor(page: Page) {
    super(page, 'Subject Access Request Admin')
    this.healthLink = this.page.locator('a', { hasText: 'Health' })
    this.reportsLink = this.page.locator('a', { hasText: 'SAR reports' })
  }

  clickHealthLink = () => this.healthLink.click()

  clickReportsLink = () => this.reportsLink.click()
}
