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
      const response = superagent
        .get(`${config.apis.serviceCatalogue.url}/sar-report-components?env=dev`)
        .set('Authorization', `OAuth ${token}`)
      return (await response).body
    } catch (error) {
      return [
        { id: '1', text: 'This means the catalogue request failed', value: 'https://foo.boo.com', environments: [] },
        { id: '2', text: 'Or', value: 'https://foo.boo.com' },
        { id: '3', text: 'This is a test', value: 'https://foo.boo.com', environments: [] },
      ]
    }
  }
}
