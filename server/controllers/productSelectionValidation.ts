export default class ProductSelectionValidation {
  static validateSelection(selections: string[], productList: Product[]): string {
    if (selections.length < 1) {
      return `At least one product must be selected`
    }
    for (let i = 0; i < selections.length; i += 1) {
      if (productList.findIndex(x => x.name.toString() === selections[i]) === -1) {
        return `Invalid product selection`
      }
    }
    return ''
  }

  static validateSingleSelection(selection: string, productList: Product[]): string {
    if (!selection) {
      return `A product must be selected`
    }
    if (productList.findIndex(product => product.id.toString() === selection) === -1) {
      return `Invalid product selection`
    }
    return ''
  }
}
