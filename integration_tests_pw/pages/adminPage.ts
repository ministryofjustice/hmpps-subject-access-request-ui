import { type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class AdminPage extends AbstractPage {
  constructor(page: Page) {
    super(page, 'Subject Access Request Admin')
  }
}
