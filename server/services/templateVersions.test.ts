import type { Request } from 'express'
import nock from 'nock'
import config from '../config'
import templateVersionsService from './templateVersions'

let sarApiMock: nock.Scope
const requestUser = { token: 'token-abc123', username: '', authSource: '' }
const product: Product = {
  id: '12345',
  name: 'service-one',
  url: 'http://service-one',
  label: 'Service One',
  order: 1,
  category: 'PRISON',
}
const v1Pending: ProductVersion = {
  createdDate: '2025-11-13T11:34:45Z',
  fileHash: 'abc',
  id: '123',
  serviceName: 'my-service',
  status: 'PENDING',
  version: 1,
}
const v1PendingFormatted: ProductVersion = { ...v1Pending, createdDate: '13 November 2025 at 11:34:45 UTC' }
const v1Published: ProductVersion = { ...v1Pending, status: 'PUBLISHED' }
const v1PublishedFormatted: ProductVersion = { ...v1Published, createdDate: '13 November 2025 at 11:34:45 UTC' }
const v2Pending: ProductVersion = {
  createdDate: '2025-05-26T09:06:56Z',
  fileHash: 'def',
  id: '456',
  serviceName: 'my-service',
  status: 'PENDING',
  version: 2,
}
const v2Published: ProductVersion = { ...v2Pending, status: 'PUBLISHED' }
const v2PublishedFormatted: ProductVersion = { ...v2Published, createdDate: '26 May 2025 at 09:06:56 UTC' }
const v3Pending: ProductVersion = {
  createdDate: '2025-07-01T12:22:07Z',
  fileHash: 'hij',
  id: '789',
  serviceName: 'my-service',
  status: 'PENDING',
  version: 3,
}
const v3PendingFormatted: ProductVersion = { ...v3Pending, createdDate: '1 July 2025 at 12:22:07 UTC' }
const v3Published: ProductVersion = { ...v3Pending, status: 'PUBLISHED' }
const v3PublishedFormatted: ProductVersion = { ...v3Published, createdDate: '1 July 2025 at 12:22:07 UTC' }

beforeEach(() => {
  sarApiMock = nock(`${config.apis.subjectAccessRequest.url}`, {
    reqheaders: { Authorization: `Bearer ${requestUser.token}` },
  })
})

afterEach(() => {
  jest.resetAllMocks()
  nock.cleanAll()
})

describe('getTemplateVersions', () => {
  const req: Request = {
    user: requestUser,
    session: { productList: [], selectedList: [] },
    body: {},
  } as unknown as Request

  test.each([
    { status: 401, expected: 'Unauthorized' },
    { status: 403, expected: 'Forbidden' },
    { status: 500, expected: 'Internal Server Error' },
  ])('should return error: "$expected" on status: $status', async ({ status, expected }) => {
    sarApiMock.get('/api/templates/service/12345').reply(status, { message: expected })

    await expect(() => templateVersionsService.getTemplateVersions(product, req)).rejects.toThrow(expected)
  })

  test.each([
    { versionsList: [], expectedList: [] },
    { versionsList: [v1Pending], expectedList: [v1PendingFormatted] },
    { versionsList: [v1Published], expectedList: [v1PublishedFormatted] },
    { versionsList: [v2Published, v3Published, v1Published], expectedList: [v3PublishedFormatted] },
    { versionsList: [v2Published, v3Pending, v1Published], expectedList: [v3PendingFormatted, v2PublishedFormatted] },
  ])('returns version list as expected', async ({ versionsList, expectedList }) => {
    sarApiMock.get('/api/templates/service/12345').reply(200, versionsList)

    const result = await templateVersionsService.getTemplateVersions(product, req)
    expect(result).toStrictEqual(expectedList)
  })
})

describe('createTemplateVersion', () => {
  const req: Request = {
    user: requestUser,
    session: { productList: [], selectedList: [] },
    body: {},
  } as unknown as Request

  const templateName = 'myfile.mustache'
  const templateBuffer = Buffer.from('dGVzdGZpbGUK', 'base64')

  test.each([
    { status: 401, expected: 'Unauthorized' },
    { status: 403, expected: 'Forbidden' },
    { status: 500, expected: 'Internal Server Error' },
  ])('should return error: "$expected" on status: $status', async ({ status, expected }) => {
    sarApiMock
      .post('/api/templates/service/12345', body => {
        const bodyStr = body.toString()
        return bodyStr.includes(`filename="${templateName}"`) && bodyStr.includes(templateBuffer)
      })
      .reply(status, { message: expected })

    await expect(() =>
      templateVersionsService.createTemplateVersion(product, templateName, templateBuffer, req),
    ).rejects.toThrow(expected)
  })

  test('returns new version created as expected', async () => {
    sarApiMock
      .post('/api/templates/service/12345', body => {
        const bodyStr = body.toString()
        return bodyStr.includes(`filename="${templateName}"`) && bodyStr.includes(templateBuffer)
      })
      .reply(200, v1Pending)

    const result = await templateVersionsService.createTemplateVersion(product, templateName, templateBuffer, req)
    expect(result).toStrictEqual(v1Pending)
  })
})
