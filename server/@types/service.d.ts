interface Service {
  id: string
  name: string
  url: string
  label: string
  order: number
  enabled?: boolean
}

interface Environment {
  environment: string
  services: Service[]
}

interface CatalogueData {
  environments: Environment[]
}
