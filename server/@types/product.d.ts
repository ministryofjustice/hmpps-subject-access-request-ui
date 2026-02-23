interface Product extends NewProduct {
  id: string
  name: string
  url: string
  label: string
  enabled?: boolean
  templateMigrated?: boolean
  category: ProductCategory
}

interface Environment {
  environment: string
  services: Product[]
}

interface CatalogueData {
  environments: Environment[]
}
