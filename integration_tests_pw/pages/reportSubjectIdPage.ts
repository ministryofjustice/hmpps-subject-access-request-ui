import { type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class ReportSubjectIdPage extends AbstractPage {
  constructor(page: Page) {
    super(page, 'Enter a HMPPS ID for the subject')
  }
}
