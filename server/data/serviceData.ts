import fs from 'fs'
import yaml from 'js-yaml'
import config from '../config'

export function getServicesData(): Service[] {
  const { env, disabledServices } = config.serviceList
  return getServicesDataByEnvironment(env).filter(service => !disabledServices.includes(service.name))
}

export function getServicesDataByEnvironment(environment: string): Service[] {
  const file = getDataFile()
  const data = yaml.load(file) as CatalogueData
  return data.environments.find((env: Environment) => env.environment === environment)?.services || []
}

function getDataFile(): string {
  const distFile = 'dist/server/data/services/services.yaml'
  if (fs.existsSync(distFile)) {
    return fs.readFileSync(distFile, 'utf8')
  }
  return fs.readFileSync('server/data/services/services.yaml', 'utf-8')
}
