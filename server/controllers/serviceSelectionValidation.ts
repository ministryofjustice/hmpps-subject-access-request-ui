export default class ServiceSelectionValidation {
  static validateSelection(selections: string[], serviceList: Service[]): string {
    if (selections.length < 1) {
      return `At least one service must be selected`
    }
    for (let i = 0; i < selections.length; i += 1) {
      if (serviceList.findIndex(x => x.name.toString() === selections[i]) === -1) {
        return `Invalid service selection`
      }
    }
    return ''
  }

  static validateSingleSelection(selection: string, serviceList: Service[]): string {
    if (!selection) {
      return `A service must be selected`
    }
    if (serviceList.findIndex(service => service.id.toString() === selection) === -1) {
      return `Invalid service selection`
    }
    return ''
  }
}
