interface Product {
  id: string
  name: string
  url: string
  label: string
  order: number
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
