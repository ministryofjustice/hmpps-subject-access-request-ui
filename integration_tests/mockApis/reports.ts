import { stubFor } from './wiremock'

const stubGetReports = responseStatus => {
  return stubFor({
    request: {
      method: 'GET',
      urlPattern: '/api/reports',
    },
    response: {
      status: responseStatus,
    },
  })
}

export default stubGetReports
