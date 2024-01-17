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
      return new Promise(resolve => {
        const list = [
          { text: 'Data from TestService1', value: 'https://foo.boo.com' },
          { text: 'Data from TestService2', value: 'https://foo.boo.com' },
          { text: 'Data from TestService3', value: 'https://foo.boo.com' },
        ]
        resolve(list)
      })
    }
  }
}
