import { stubFor } from './wiremock'

const stubServiceList = responseBody => {
  return stubFor({
    request: {
      method: 'GET',
      urlPattern: '/sar-report-components\\?env=dev',
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

export default stubServiceList
