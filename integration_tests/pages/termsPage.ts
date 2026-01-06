import { Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class TermsPage extends AbstractPage {
  readonly termsAndConditions: Locator

  readonly linkToHomepage: Locator

  constructor(page: Page) {
    super(page, 'Terms and conditions')
    this.termsAndConditions = this.page.locator('.terms-and-conditions-text')
    this.linkToHomepage = this.page.locator('a', { hasText: 'Home' })
  }

  home = () => this.linkToHomepage.click()
}
