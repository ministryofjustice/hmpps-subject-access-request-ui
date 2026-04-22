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
        category: 'PRISON',
        enabled: true,
        templateMigrated: true,
        suspended: false,
        suspendedAt: null,
      },
      {
        id: '2',
        name: 'service-two',
        url: 'http://service-two',
        label: 'Service Two',
        category: 'PROBATION',
        enabled: true,
        templateMigrated: false,
        suspended: false,
        suspendedAt: null,
      },
      {
        id: '3',
        name: 'service-three',
        url: 'http://service-three',
        label: 'Service Three',
        category: 'PRISON',
        enabled: false,
        templateMigrated: false,
        suspended: false,
        suspendedAt: null,
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

  stubGetProductsSuspended: (
    httpStatus = 200,
    body = [
      {
        id: '1',
        name: 'service-one',
        url: 'http://service-one',
        label: 'Service One',
        category: 'PRISON',
        enabled: true,
        templateMigrated: true,
        suspended: false,
        suspendedAt: null,
      },
      {
        id: '2',
        name: 'service-two',
        url: 'http://service-two',
        label: 'Service Two',
        category: 'PROBATION',
        enabled: true,
        templateMigrated: false,
        suspended: false,
        suspendedAt: null,
      },
      {
        id: '99',
        name: 'service-ninety-nine',
        url: 'http://service-ninety-nine',
        label: 'Service Ninety Nine',
        category: 'PROBATION',
        enabled: true,
        templateMigrated: false,
        suspended: true,
        suspendedAt: '10/03/2026 15:50:53',
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

  stubGetProductsError: (httpStatus = 500, body = { error: 'something went wrong' }): SuperAgentRequest =>
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

  stubCreateProduct: (httpStatus = 201): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: '/api/services',
      },
      response: {
        status: httpStatus,
      },
    }),

  stubUpdateProduct: (httpStatus = 200, id = 1): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/api/services/${id}`,
      },
      response: {
        status: httpStatus,
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
        services: [
          'hmpps-activities-management-api',
          'https://activities-api-dev.prison.service.justice.gov.uk,keyworker-api',
          'https://keyworker-api-dev.prison.service.justice.gov.uk,hmpps-manage-adjudications-api',
          'https://manage-adjudications-api-dev.hmpps.service.justice.gov.uk',
        ],
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
        services: [
          'hmpps-activities-management-api',
          'https://activities-api-dev.prison.service.justice.gov.uk,keyworker-api',
          'https://keyworker-api-dev.prison.service.justice.gov.uk,hmpps-manage-adjudications-api',
          'https://manage-adjudications-api-dev.hmpps.service.justice.gov.uk',
        ],
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
        services: [
          'hmpps-activities-management-api',
          'https://activities-api-dev.prison.service.justice.gov.uk,keyworker-api',
          'https://keyworker-api-dev.prison.service.justice.gov.uk,hmpps-manage-adjudications-api',
          'https://manage-adjudications-api-dev.hmpps.service.justice.gov.uk',
        ],
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

  stubGetSubjectAccessRequest: ({
    body = {
      id: 'aaaaaaaa-cb77-4c0e-a4de-1efc0e86ff34',
      status: 'Pending',
      dateFrom: '2024-03-01',
      dateTo: '2024-03-12',
      sarCaseReferenceNumber: 'caseRef1',
      services: [
        {
          serviceName: 'hmpps-activities-management-api',
          serviceLabel: 'Manage activities and appointments',
          renderStatus: 'PENDING',
          templateVersion: 3,
          renderedAt: '2026-03-30T11:25:10.150Z',
        },
        {
          serviceName: 'keyworker-api',
          serviceLabel: 'Allocate Keyworkers and Personal Officers',
          renderStatus: 'ERRORED',
          templateVersion: 5,
          renderedAt: '2026-03-29T15:08:45.123Z',
        },
        {
          serviceName: 'hmpps-manage-adjudications-api',
          serviceLabel: 'Adjudications',
          renderStatus: 'COMPLETE',
          templateVersion: 6,
          renderedAt: '2026-03-30T08:03:56.986Z',
        },
      ],
      nomisId: '',
      ndeliusCaseReferenceId: 'A123456',
      requestedBy: 'user',
      requestDateTime: '2025-03-07T13:52:40.14177',
      claimDateTime: '2025-03-07T14:49:08.67033',
      claimAttempts: 1,
      objectUrl: null,
      lastDownloaded: '2024-03-28T16:33:27.493Z',
    },
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: `/api/subjectAccessRequest/${body.id}`,
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

  stubValidateTemplateSuccess: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPath: `/api/templates/validate`,
      },
      response: {
        status: 200,
      },
    }),

  stubValidateTemplateFailure: (
    httpStatus = 400,
    body = { userMessage: 'Invalid template syntax' },
  ): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPath: `/api/templates/validate`,
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: body,
      },
    }),

  stubValidateTemplateFault: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPath: `/api/templates/validate`,
      },
      response: {
        fault: 'RANDOM_DATA_THEN_CLOSE',
      },
    }),
}
