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

const stubRestartSubjectAccessRequest = args => {
  return stubFor({
    request: {
      method: 'PATCH',
      urlPattern: `/api/admin/subjectAccessRequests/${args.sarId}/restart`,
    },
    response: {
      status: args.responseStatus,
      headers: {
        'Content-Type': 'application/json;',
      },
      jsonBody: {
        userMessage: args.responseMessage,
      },
    },
  })
}

export default {
  stubGetSubjectAccessRequests,
  stubGetTotalSubjectAccessRequests,
  stubGetSubjectAccessRequestAdminSummary,
  stubRestartSubjectAccessRequest,
}
