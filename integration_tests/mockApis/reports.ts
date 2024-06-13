import { stubFor } from './wiremock'

const stubGetReports = responseBody => {
  return stubFor({
    request: {
      method: 'GET',
      urlPattern: '/api/subjectAccessRequests\\?pageSize=50&pageNumber=0',
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

const stubGetTotalReports = responseBody => {
  return stubFor({
    request: {
      method: 'GET',
      urlPattern: '/api/totalSubjectAccessRequests',
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

export default { stubGetReports, stubGetTotalReports }
