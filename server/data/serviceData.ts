import fs from 'fs'
import yaml from 'js-yaml'
import config from '../config'

export interface ServiceDataItem {
  name: string
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

export function getServicesDataByEnvironment(environment: string): ServiceDataItem[] {
  const file = getDataFile()
  const data = yaml.load(file) as CatalogueData

  const services = data.environments.find((env: Environment) => env.environment === environment)?.services || []
  return services.map((service: Service) => ({
    name: service.name,
    url: service.url,
    label: service.label,
    order: service.order,
    disabled: service.disabled === undefined ? false : service.disabled,
  }))
}

function getDataFile(): string {
  const distFile = 'dist/server/data/services/services.yaml'
  if (fs.existsSync(distFile)) {
    return fs.readFileSync(distFile, 'utf8')
  }
  return fs.readFileSync('server/data/services/services.yaml', 'utf-8')
}

export function getServicesData(): ServiceDataItem[] {
  const { env, disabledServices } = config.serviceList
  const services = getServicesDataByEnvironment(env)

  return services
    .map(service => ({
      ...service,
      disabled: service.disabled || disabledServices.includes(service.name),
    }))
    .sort((a, b) => a.order - b.order)
}
