import superagent from 'superagent'
import config from '../config'
import { getServiceCatalogueByEnvironment, ServiceCatalogueItem } from './serviceCatalogueData'

export default class ServiceCatalogueClient {
  public getServiceList = (): ServiceCatalogueItem[] => {
    const { env, disabledServices } = config.serviceCatalogue;
    const services = getServiceCatalogueByEnvironment(env);

    return services.map(service => ({
      ...service,
      disabled: service.disabled || disabledServices.includes(service.name),
    }));
  }
}
