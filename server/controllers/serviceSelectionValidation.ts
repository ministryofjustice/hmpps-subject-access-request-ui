import { serialize } from 'v8'
import { ApiService } from '../@types/apiservice'

export default class ServiceSelectionValidation {
  static validateSelection(selections: string[], serviceList: ApiService[]): string {
    if (selections.length < 1) {
      return `At least one service must be selected`
    }
    for (let i = 0; i < selections.length; i += 1) {
      if (serviceList.findIndex(x => x.id.toString() === selections[i]) === -1) {
        return `Invalid service selection`
      }
    }

    return ''
  }
}
