import { type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class ReportsPage extends AbstractPage {
  constructor(page: Page) {
    super(page, 'Subject Access Request Reports')
  }
}
