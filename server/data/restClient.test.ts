import nock from 'nock'
import superagent from 'superagent'

import { AgentConfig } from '../config'
import RestClient from './restClient'
import logger from '../../logger'

const restClient = new RestClient(
  'api-name',
  {
    url: 'http://localhost:8080/api',
    timeout: {
      response: 1000,
      deadline: 1000,
    },
    agent: new AgentConfig(1000),
  },
  'token-1',
)

describe.each(['get', 'patch', 'post', 'put', 'delete'] as const)('Method: %s', method => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('does not log sensitive response data on failure', async () => {
    const secret = 'synthetic-response-token'
    const logWarn = jest.spyOn(logger, 'warn').mockImplementation()
    nock('http://localhost:8080')[method]('/api/test').reply(403, { access_token: secret }, { 'set-cookie': secret })

    await expect(restClient[method]({ path: '/test' })).rejects.toMatchObject({ status: 403 })

    expect(logWarn.mock.calls).toEqual([
      [{ status: 403, stack: expect.any(String) }, `Error calling api-name, verb: '${method.toUpperCase()}'`],
    ])
    expect(JSON.stringify(logWarn.mock.calls)).not.toContain(secret)
    expect(nock.isDone()).toBe(true)
  })

  it('logs network failure stack frames without logging error messages', async () => {
    const secret = 'synthetic-network-error-secret'
    const logWarn = jest.spyOn(logger, 'warn').mockImplementation()
    const logInfo = jest.spyOn(logger, 'info').mockImplementation()
    const networkError = Object.assign(new Error(secret), { code: 'ECONNRESET' })
    jest
      .spyOn(superagent.Request.prototype, 'then')
      .mockImplementationOnce((resolve, reject) => Promise.reject(networkError).then(resolve, reject))

    await expect(restClient[method]({ path: '/test' })).rejects.toThrow(secret)

    expect(logWarn.mock.calls).toEqual([
      [{ stack: expect.any(String) }, `Error calling api-name, verb: '${method.toUpperCase()}'`],
    ])
    expect(JSON.stringify([...logWarn.mock.calls, ...logInfo.mock.calls])).not.toContain(secret)
    expect(nock.isDone()).toBe(true)
  })

  it('should return response body', async () => {
    nock('http://localhost:8080', {
      reqheaders: { authorization: 'Bearer token-1' },
    })
      [method]('/api/test')
      .reply(200, { success: true })

    const result = await restClient[method]({
      path: '/test',
    })

    expect(nock.isDone()).toBe(true)

    expect(result).toStrictEqual({
      success: true,
    })
  })

  it('should return raw response body', async () => {
    nock('http://localhost:8080', {
      reqheaders: { authorization: 'Bearer token-1' },
    })
      [method]('/api/test')
      .reply(200, { success: true })

    const result = await restClient[method]({
      path: '/test',
      headers: { header1: 'headerValue1' },
      raw: true,
    })

    expect(nock.isDone()).toBe(true)

    expect(result).toMatchObject({
      req: { method: method.toUpperCase() },
      status: 200,
      text: '{"success":true}',
    })
  })

  if (method === 'get' || method === 'delete') {
    it('should retry by default', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token-1' },
      })
        [method]('/api/test')
        .reply(500)
        [method]('/api/test')
        .reply(500)
        [method]('/api/test')
        .reply(500)

      await expect(
        restClient[method]({
          path: '/test',
          headers: { header1: 'headerValue1' },
        }),
      ).rejects.toThrow('Internal Server Error')

      expect(nock.isDone()).toBe(true)
    })
  } else {
    it('should not retry by default', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token-1' },
      })
        [method]('/api/test')
        .reply(500)

      await expect(
        restClient[method]({
          path: '/test',
          headers: { header1: 'headerValue1' },
        }),
      ).rejects.toThrow('Internal Server Error')

      expect(nock.isDone()).toBe(true)
    })

    it('should retry if configured to do so', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token-1' },
      })
        [method]('/api/test')
        .reply(500)
        [method]('/api/test')
        .reply(500)
        [method]('/api/test')
        .reply(500)

      await expect(
        restClient[method]({
          path: '/test',
          headers: { header1: 'headerValue1' },
          retry: true,
        }),
      ).rejects.toThrow('Internal Server Error')

      expect(nock.isDone()).toBe(true)
    })
  }

  it('can recover through retries', async () => {
    nock('http://localhost:8080', {
      reqheaders: { authorization: 'Bearer token-1' },
    })
      [method]('/api/test')
      .reply(500)
      [method]('/api/test')
      .reply(500)
      [method]('/api/test')
      .reply(200, { success: true })

    const result = await restClient[method]({
      path: '/test',
      headers: { header1: 'headerValue1' },
      retry: true,
    })

    expect(result).toStrictEqual({ success: true })
    expect(nock.isDone()).toBe(true)
  })
})

describe('stream', () => {
  afterEach(() => jest.restoreAllMocks())

  it('rejects failures without propagating the request containing the bearer token', async () => {
    const logWarn = jest.spyOn(logger, 'warn').mockImplementation()
    nock('http://localhost:8080').get('/api/test').reply(403, { message: 'Forbidden' })

    const result = restClient.stream({ path: '/test' })
    await expect(result).rejects.toMatchObject({ status: 403, message: 'Forbidden' })
    await expect(result).rejects.not.toHaveProperty('response')
    await expect(result).rejects.not.toHaveProperty('request')

    expect(logWarn.mock.calls).toEqual([[{ status: 403, stack: expect.any(String) }, 'Error calling api-name']])
    expect(nock.isDone()).toBe(true)
  })
})
