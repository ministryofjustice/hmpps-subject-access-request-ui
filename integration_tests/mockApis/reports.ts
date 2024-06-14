import { stubFor } from './wiremock'

const stubGetSubjectAccessRequests = responseBody => {
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

const stubGetTotalSubjectAccessRequests = responseBody => {
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

export default { stubGetSubjectAccessRequests, stubGetTotalSubjectAccessRequests }
