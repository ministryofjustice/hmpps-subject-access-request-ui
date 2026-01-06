import { type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class AuthErrorPage extends AbstractPage {
  constructor(page: Page) {
    super(page, 'Authorisation Error')
  }
}
