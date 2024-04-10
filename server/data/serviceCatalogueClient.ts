import superagent from 'superagent'
import config from '../config'
import { dataAccess } from '.'

export default class ServiceCatalogueClient {
  static async getSystemToken() {
    const token = await dataAccess().hmppsAuthClient.getSystemClientToken()
    return token
  }

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  async getServiceList(): Promise<any> {
    const token = await ServiceCatalogueClient.getSystemToken()
    try {
      const response = await superagent
        .get(`${config.apis.serviceCatalogue.url}/sar-report-components?env=${config.apis.serviceCatalogue.env}`)
        .set('Authorization', `OAuth ${token}`)
      const { body } = response
      return body
    } catch (error) {
      return []
    }
  }
}
