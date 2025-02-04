import { stubFor } from './wiremock'

const stubGetServicesRequest = responseBody => {
  return stubFor({
    request: {
      method: 'GET',
      urlPattern: '/api/services',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;',
      },
      jsonBody: responseBody,
    },
  })
}

export default { stubGetServicesRequest }
