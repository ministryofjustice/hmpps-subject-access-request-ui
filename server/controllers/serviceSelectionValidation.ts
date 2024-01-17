import { serialize } from 'v8'
import { ApiService } from '../@types/apiservice'

export default class ServiceSelectionValidation {
  static validateSelection(selections: string[], serviceList: ApiService[]): string {
    if (selections.length < 1) {
      return `At least one service must be selected`
    }
    for (let i = 0; i < selections.length; i += 1) {
      // console.log("SELECT", selections, selections[0], serviceList[0].id)
      // console.log("LIST", serviceList, serviceList.findIndex(x => x.id === selections[0]))
      // console.log("TEST", serviceList[0].id == selections[0])
      // console.log("TEST", serviceList[0].id === selections[0])
      // console.log("TEST", typeof(serviceList[0].id),typeof(selections[0]))
      if (serviceList.findIndex(x => x.id.toString() === selections[i]) === -1) {
        return `Invalid service selection`
      }
    }

    return ''
  }
}
