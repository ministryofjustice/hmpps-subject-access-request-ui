interface NewProduct {
  name: string
  url: string
  label: string
  enabled?: boolean
  templateMigrated?: boolean
  category: ProductCategory
}

interface Product extends NewProduct {
  id: string
}

interface Environment {
  environment: string
  services: Product[]
}

interface CatalogueData {
  environments: Environment[]
}
