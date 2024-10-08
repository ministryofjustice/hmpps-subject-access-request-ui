import fs from 'fs'
import yaml from 'js-yaml'

export interface ServiceCatalogueItem {
  name: string
  environment: string
  url: string
  label: string
  order: number
}

export function getServiceCatalogueByEnvironment(environment: string): ServiceCatalogueItem[] {
  const file = fs.readFileSync('server/data/serviceCatalogue/serviceCatalogue.yaml', 'utf8')
  const data = yaml.load(file) as any

  const services = data.environments.find((env: unknown) => env.environment === environment)?.services || []
  return services.map((service: unknown) => ({
    name: service.name,
    environment: environment,
    url: service.url,
    label: service.label,
    order: service.order,
  }))
}

