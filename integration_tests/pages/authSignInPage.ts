import { type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class AuthSignInPage extends AbstractPage {
  constructor(page: Page) {
    super(page, 'Sign In')
  }
}
