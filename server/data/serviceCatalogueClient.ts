import superagent from 'superagent'

const apiurl = 'http://localhost:1337/products'
export default class ServiceCatalogueClient {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  getServices(token: string): Promise<any[]> {
    return new Promise(resolve => {
      superagent
        .get(apiurl)
        .set('Authorization', `OAuth ${token}`)
        .end((error, res) => {
          if (error) {
            const list = [
              {
                value: 'Select All',
                text: 'Select All',
              },
              {
                divider: 'or',
              },
              { text: 'Data from TestService1', value: 'https://foo.boo.com' },
              { text: 'Data from TestService2', value: 'https://foo.boo.com' },
              { text: 'Data from TestService3', value: 'https://foo.boo.com' },
            ]
            resolve(list)
          } else {
            // TODO: implement logic to get list of service from Service Catalogue response
          }
        })
    })
  }
}
