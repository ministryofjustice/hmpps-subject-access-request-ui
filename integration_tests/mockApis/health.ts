import { stubFor } from './wiremock'

const stubGetHealth = responseBody => {
  return stubFor({
    request: {
      method: 'GET',
      urlPattern: '/health',
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

export default { stubGetHealth }
