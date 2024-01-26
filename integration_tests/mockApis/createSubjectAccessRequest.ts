import { stubFor } from './wiremock'

const stubCreateSubjectAccessRequest = responseStatus => {
  return stubFor({
    request: {
      method: 'POST',
      urlPattern: '/api/createSubjectAccessRequest',
    },
    response: {
      status: responseStatus,
    },
  })
}

export default stubCreateSubjectAccessRequest
