// import superagent from 'superagent'
// import config from '../config'

export default class ServiceCatalogueClient {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  async getServiceList(): Promise<any[]> {
    // token: string
    return new Promise(resolve => {
      const list = [
        { id: '1', text: 'TestService1', value: 'https://foo.boo.com' },
        { id: '2', text: 'TestService2', value: 'https://foo.boo.com' },
        { id: '3', text: 'TestService3', value: 'https://foo.boo.com' },
      ]
      resolve(list)
      // superagent
      //   .get(`${config.apis.serviceCatalogue.url}/products`)
      //   .set('Authorization', `OAuth ${token}`)
      //   .end((error, res) => {
      //     if (error) {
      //       const list = [
      //         { text: 'Data from TestService1', value: 'https://foo.boo.com' },
      //         { text: 'Data from TestService2', value: 'https://foo.boo.com' },
      //         { text: 'Data from TestService3', value: 'https://foo.boo.com' },
      //       ]
      //       resolve(list)
      //     } else {
      //       // TODO: implement logic to get list of service from Service Catalogue response
      //     }
      //   })
    })
  }
}
