interface NewProduct {
  id: string
  name: string
  url: string
  label: string
  enabled?: boolean
  templateMigrated?: boolean
  category: ProductCategory
}

interface Product extends NewProduct {
  suspended: boolean
  suspendedAt: string
}

interface Environment {
  environment: string
  services: Product[]
}

interface CatalogueData {
  environments: Environment[]
}
