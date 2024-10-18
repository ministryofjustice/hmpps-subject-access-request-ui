import fs from 'fs'
import yaml from 'js-yaml'
import config from '../config'

export interface ServiceCatalogueItem {
  name: string
  environment: string
  url: string
  label: string
  order: number
  disabled: boolean
}

interface Service {
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

export function getServiceCatalogueByEnvironment(environment: string): ServiceCatalogueItem[] {
  const file = fs.readFileSync('server/data/serviceCatalogue/serviceCatalogue.yaml', 'utf8')
  const data = yaml.load(file) as CatalogueData

  const services = data.environments.find((env: Environment) => env.environment === environment)?.services || []
  return services.map((service: Service) => ({
    name: service.name,
    environment,
    url: service.url,
    label: service.label,
    order: service.order,
    disabled: service.disabled === undefined ? false : service.disabled,
  }))
}

export function getServiceList(): ServiceCatalogueItem[] {
  const { env, disabledServices } = config.serviceCatalogue
  const services = getServiceCatalogueByEnvironment(env)

  return services
    .map(service => ({
      ...service,
      disabled: service.disabled || disabledServices.includes(service.name),
    }))
    .sort((a, b) => a.order - b.order)
}
