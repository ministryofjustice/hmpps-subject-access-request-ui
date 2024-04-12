import { stubFor } from './wiremock'

const stubGetReports = responseBody => {
  return stubFor({
    request: {
      method: 'GET',
      urlPattern: '/api/reports',
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

export default stubGetReports
