import { type Page } from '@playwright/test'
import AdminProductConfigInputPage from './adminProductConfigInputPage'

export default class AdminUpdateProductConfigPage extends AdminProductConfigInputPage {
  constructor(page: Page) {
    super(page, 'Update Product Configuration')
  }
}
