interface Service {
  id: string
  name: string
  url: string
  label: string
  order: number
  disabled?: boolean
}

interface Environment {
  environment: string
  services: Service[]
}

interface CatalogueData {
  environments: Environment[]
}
