import { ApiService } from '../@types/apiservice'

export default class ServiceSelectionValidation {
  static validateSelection(selections: ApiService[]): string {
    let selectedServicesError = ''
    if (!selections || selections.length < 1) {
      selectedServicesError = `At least one service must be selected`
    }

    return selectedServicesError
  }
}
