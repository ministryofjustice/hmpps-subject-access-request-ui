import superagent from 'superagent'
import config from '../config'
import { dataAccess } from '.'

export default class ServiceCatalogueClient {
  static async getUserToken() {
    const token = await dataAccess().hmppsAuthClient.getSystemClientToken()
    return token
  }

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  async getServiceList(): Promise<any> {
    const token = await ServiceCatalogueClient.getUserToken()
    try {
      const response = await superagent
        .get(`${config.apis.serviceCatalogue.url}`)
        .set('Authorization', `OAuth ${token}`)
      const { body } = response
      return body
    } catch (error) {
      return []
    }
  }
}
