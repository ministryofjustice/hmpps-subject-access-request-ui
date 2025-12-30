import type { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'

export default {
  stubGetSubjectAccessRequestAdminSummary: (
    httpStatus = 200,
    body = {
      requests: [
        {
          id: 'aaaaaaaa-cb77-4c0e-a4de-1efc0e86ff34',
          status: 'Pending',
          dateFrom: '2024-03-01',
          dateTo: '2024-03-12',
          sarCaseReferenceNumber: 'caseRef1',
          services: 'hmpps-activities-management-api, keyworker-api, hmpps-manage-adjudications-api',
          nomisId: '',
          ndeliusCaseReferenceId: 'A123456',
          requestedBy: 'user',
          requestDateTime: '2024-03-12T13:52:40.14177',
          claimDateTime: '2024-03-27T14:49:08.67033',
          claimAttempts: 1,
          objectUrl: null,
          lastDownloaded: '2024-03-28T16:33:27.84934',
          durationHumanReadable: '6h',
          appInsightsEventsUrl: 'http://appinsights',
        },
        {
          id: 'bbbbbbbb-cb77-4c0e-a4de-1efc0e86ff34',
          status: 'Completed',
          dateFrom: '2023-03-01',
          dateTo: '2023-03-12',
          sarCaseReferenceNumber: 'caseRef2',
          services: 'hmpps-activities-management-api, keyworker-api, hmpps-manage-adjudications-api',
          nomisId: '',
          ndeliusCaseReferenceId: 'A123456',
          requestedBy: 'user',
          requestDateTime: '2023-03-12T13:52:40.14177',
          claimDateTime: '2023-03-27T14:49:08.67033',
          claimAttempts: 1,
          objectUrl: null,
          lastDownloaded: null,
          durationHumanReadable: '7h',
          appInsightsEventsUrl: 'http://appinsights',
        },
        {
          id: 'cccccccc-cb77-4c0e-a4de-1efc0e86ff34',
          status: 'Errored',
          dateFrom: '2022-03-01',
          dateTo: '2022-03-12',
          sarCaseReferenceNumber: 'caseRef3',
          services: 'hmpps-activities-management-api, keyworker-api, hmpps-manage-adjudications-api',
          nomisId: '',
          ndeliusCaseReferenceId: 'A123456',
          requestedBy: 'user',
          requestDateTime: '2022-03-12T13:52:40.14177',
          claimDateTime: '2022-03-27T14:49:08.67033',
          claimAttempts: 1,
          objectUrl: null,
          lastDownloaded: null,
          durationHumanReadable: '8h',
          appInsightsEventsUrl: 'http://appinsights',
        },
      ],
      filterCount: 3,
      totalCount: 15,
      completedCount: 8,
      erroredCount: 6,
      overdueCount: 4,
      pendingCount: 2,
    },
  ): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: '/api/admin/subjectAccessRequests',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: body,
      },
    }),

  stubRestartSubjectAccessRequest: ({ sarId = '', httpStatus = 200, responseMessage = '' }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'PATCH',
        urlPattern: `/api/admin/subjectAccessRequests/${sarId}/restart`,
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          userMessage: responseMessage,
        },
      },
    }),
}
