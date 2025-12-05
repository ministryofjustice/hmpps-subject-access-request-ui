import type { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'

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
  }): SuperAgentRequest =>
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
