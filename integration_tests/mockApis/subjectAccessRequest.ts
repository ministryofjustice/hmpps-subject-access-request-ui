import { stubFor } from './wiremock'

const stubSubjectAccessRequest = responseStatus => {
  return stubFor({
    request: {
      method: 'POST',
      urlPattern: '/api/subjectAccessRequest',
    },
    response: {
      status: responseStatus,
    },
  })
}

export default stubSubjectAccessRequest
