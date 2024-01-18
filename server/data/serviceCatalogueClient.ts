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
        .get(`${config.apis.serviceCatalogue.url}/sar-report-components?env=dev`)
        .set('Authorization', `OAuth ${token}`)
      const body = response.body;

      console.log(config.apis.serviceCatalogue.url);
      console.log(body); // Verify it came from the wiremock stub

      return (await response).body
    } catch (error) {
      return [
        // {
        //   id: '1',
        //   name: 'This is a TEST service.',
        //   environments: [{ id: 1, url: 'www.foo.com' }],
        // },
      ]
    }
  }
}
