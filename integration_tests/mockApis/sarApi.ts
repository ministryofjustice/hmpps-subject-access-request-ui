import type { SuperAgentRequest } from 'superagent'
import { getMatchingRequests, stubFor } from './wiremock'

type StubGetTemplateVersionsArgs = {
  httpStatus?: number
  productId?: string
  status?: string
  body?: object
}

export default {
  stubPing: (httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/example-api/health/ping',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { status: httpStatus === 200 ? 'UP' : 'DOWN' },
      },
    }),

  stubGetProducts: (
    httpStatus = 200,
    body = [
      {
        id: '1',
        name: 'service-one',
        url: 'http://service-one',
        label: 'Service One',
        order: 1,
        enabled: true,
        templateMigrated: true,
      },
      {
        id: '2',
        name: 'service-two',
        url: 'http://service-two',
        label: 'Service Two',
        order: 2,
        enabled: true,
        templateMigrated: false,
      },
    ],
  ): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/services',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: body,
      },
    }),

  stubSubjectAccessRequest: ({ httpStatus = 201 }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: '/api/subjectAccessRequest',
      },
      response: {
        status: httpStatus,
      },
    }),

  stubGetSubjectAccessRequests: ({
    body = [
      {
        id: 'aaaaaaaa-cb77-4c0e-a4de-1efc0e86ff34',
        status: 'Pending',
        dateFrom: '2024-03-01',
        dateTo: '2024-03-12',
        sarCaseReferenceNumber: 'caseRef1',
        services:
          'hmpps-activities-management-api, https://activities-api-dev.prison.service.justice.gov.uk,keyworker-api, https://keyworker-api-dev.prison.service.justice.gov.uk,hmpps-manage-adjudications-api, https://manage-adjudications-api-dev.hmpps.service.justice.gov.uk',
        nomisId: '',
        ndeliusCaseReferenceId: 'A123456',
        requestedBy: 'user',
        requestDateTime: '2025-03-07T13:52:40.14177',
        claimDateTime: '2025-03-07T14:49:08.67033',
        claimAttempts: 1,
        objectUrl: null,
        lastDownloaded: null,
      },
      {
        id: 'bbbbbbbb-cb77-4c0e-a4de-1efc0e86ff34',
        status: 'Completed',
        dateFrom: '2023-03-01',
        dateTo: '2023-03-12',
        sarCaseReferenceNumber: 'caseRef2',
        services:
          'hmpps-activities-management-api, https://activities-api-dev.prison.service.justice.gov.uk,keyworker-api, https://keyworker-api-dev.prison.service.justice.gov.uk,hmpps-manage-adjudications-api, https://manage-adjudications-api-dev.hmpps.service.justice.gov.uk',
        nomisId: '',
        ndeliusCaseReferenceId: 'A123456',
        requestedBy: 'user',
        requestDateTime: '2023-01-10T13:56:40.14177',
        claimDateTime: '2023-01-10T14:49:08.67033',
        claimAttempts: 1,
        objectUrl: null,
        lastDownloaded: null,
      },
      {
        id: 'cccccccc-cb77-4c0e-a4de-1efc0e86ff34',
        status: 'Completed',
        dateFrom: '2022-03-01',
        dateTo: '2022-03-12',
        sarCaseReferenceNumber: 'caseRef3',
        services:
          'hmpps-activities-management-api, https://activities-api-dev.prison.service.justice.gov.uk,keyworker-api, https://keyworker-api-dev.prison.service.justice.gov.uk,hmpps-manage-adjudications-api, https://manage-adjudications-api-dev.hmpps.service.justice.gov.uk',
        nomisId: '',
        ndeliusCaseReferenceId: 'A123456',
        requestedBy: 'user',
        requestDateTime: '2022-03-07T12:53:40.14177',
        claimDateTime: '2022-03-07T14:49:08.67033',
        claimAttempts: 1,
        objectUrl: null,
        lastDownloaded: null,
      },
    ],
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: '/api/subjectAccessRequests',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;',
        },
        jsonBody: body,
      },
    }),

  getSubjectAccessRequestsWithSearchValue: (searchValue: string): Promise<string> =>
    getMatchingRequests({
      method: 'GET',
      urlPath: '/api/subjectAccessRequests',
      queryParameters: { search: { equalTo: searchValue } },
    }).then(data => data.body.requests),

  stubGetTotalSubjectAccessRequests: (body = 3): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: '/api/totalSubjectAccessRequests',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;',
        },
        jsonBody: body,
      },
    }),

  stubGetTemplateVersions: ({
    httpStatus = 200,
    productId = '1',
    status = 'PUBLISHED',
    body = [
      {
        id: productId,
        serviceName: 'Service One',
        version: 1,
        createdDate: '2025-06-13T12:43:44Z',
        fileHash: '123abc',
        status,
      },
    ],
  }: StubGetTemplateVersionsArgs): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/api/templates/service/${productId}`,
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: body,
      },
    }),

  stubUploadTemplateFile: ({
    httpStatus = 200,
    body = {
      id: '1',
      serviceName: 'Service One',
      version: 2,
      createdDate: '2025-11-25T14:05:24Z',
      fileHash: '456def',
      status: 'PENDING',
    },
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: `/api/templates/service/1`,
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: body,
      },
    }),
}
