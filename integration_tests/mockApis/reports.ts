import { stubFor } from './wiremock'

const stubGetSubjectAccessRequests = responseBody => {
  return stubFor({
    request: {
      method: 'GET',
      urlPattern: '/api/subjectAccessRequests\\?pageSize=50&pageNumber=0&search=',
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

const stubGetSubjectAccessRequestAdminSummary = responseBody => {
  return stubFor({
    request: {
      method: 'GET',
      urlPath: '/api/admin/subjectAccessRequests',
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
      urlPattern: '/api/totalSubjectAccessRequests\\?search=',
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

export default {
  stubGetSubjectAccessRequests,
  stubGetTotalSubjectAccessRequests,
  stubGetSubjectAccessRequestAdminSummary,
}
