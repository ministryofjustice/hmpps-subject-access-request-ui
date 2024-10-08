import superagent from 'superagent'
import config from '../config'
import { dataAccess } from '.'
import { getServiceCatalogueByEnvironment, ServiceCatalogueItem } from './serviceCatalogueData'

export default class ServiceCatalogueClient {
  static async getSystemToken() {
    const token = await dataAccess().hmppsAuthClient.getSystemClientToken()
    return token
  }

  public getServiceList = (): ServiceCatalogueItem[] => {
    return getServiceCatalogueByEnvironment(config.apis.serviceCatalogue.env)
  }
}
