import { PassThrough } from 'stream'
import bunyan from 'bunyan'
import bunyanFormat from 'bunyan-format'
import errorLogFields from './errorLogFields'

describe('errorLogFields', () => {
  it('preserves Node stack frames without the error message or non-frame text', () => {
    const frames = [
      '    at getReport (/app/dist/server/services/report.js:72:22)',
      '    at async handler (/app/dist/server/errorHandler.js:10:5)',
      '    at process.processTicksAndRejections (node:internal/process/task_queues:90:21)',
    ]
    const stack = ['Error: private', 'Authorization: Bearer private', ...frames].join('\n')

    expect(errorLogFields({ name: 'Error', message: 'private', stack })).toEqual({ stack: frames.join('\n') })
  })

  it('limits stack output to 20 frames', () => {
    const stack = ['Error: private', ...Array(30).fill('    at handler (/app/server/errorHandler.ts:10:5)')].join('\n')
    expect(errorLogFields({ name: 'Error', message: 'private', stack }).stack?.split('\n')).toHaveLength(20)
  })

  it('caps stack input at 64 KiB', () => {
    const stack = `Error: ${'x'.repeat(65536)}\n    at handler (/app/server/errorHandler.ts:10:5)`
    expect(errorLogFields({ name: 'Error', message: 'x'.repeat(65536), stack })).toEqual({})
  })

  it('removes the complete multiline message from a real Error before retaining frames', () => {
    const secret = 'synthetic-private-token'
    const error = new Error(`OAuth failure\n    at Authorization: Bearer ${secret}`)

    const fields = errorLogFields(error)

    expect(fields.stack).toContain('errorLogFields.test.ts:')
    expect(fields.stack).not.toContain(secret)
    expect(fields.stack).not.toContain('Authorization')
    expect(fields.stack).not.toContain('OAuth failure')
  })

  it.each([
    { stack: 'Error: private\n    at Authorization: Bearer private' },
    { name: 'Error', message: 'changed', stack: 'Error: original\n    at handler (/app/server.js:1:1)' },
    { name: 'Error', message: 'private', stack: 'Custom stack\n    at handler (/app/server.js:1:1)' },
    { name: 'Error', message: 'private', stack: 'Error: private-extra\n    at handler (/app/server.js:1:1)' },
  ])('omits the stack when the complete message boundary cannot be established', error => {
    expect(errorLogFields({ ...error, status: 403 })).toEqual({ status: 403 })
  })

  it('handles a standard stack header with an empty message', () => {
    const frame = '    at handler (/app/server.js:1:1)'
    expect(errorLogFields({ name: 'Error', message: '', stack: `Error\n${frame}` })).toEqual({ stack: frame })
  })

  it('copies status without modifying the original error', () => {
    const error = Object.freeze({ status: 403, code: 'ECONNRESET', timeout: 1000, message: 'private' })

    expect(errorLogFields(error)).toEqual({ status: 403 })
    expect(error).toEqual({ status: 403, code: 'ECONNRESET', timeout: 1000, message: 'private' })
  })

  it.each([undefined, null, 'private', {}, { status: 'private', stack: {} }, { status: NaN }, { status: Infinity }])(
    'omits unsupported fields from %p',
    error => {
      expect(errorLogFields(error)).toEqual({})
    },
  )

  it('does not coerce, replace or clamp numeric status values', () => {
    expect(errorLogFields({ status: 600 })).toEqual({ status: 600 })
    expect(errorLogFields({ status: '403' })).toEqual({})
  })

  it('excludes token-bearing messages and nested HTTP objects from formatted output', () => {
    const secret = 'synthetic-private-token'
    const stackFrame = '    at handler (/app/server/errorHandler.ts:10:5)'
    const error = Object.assign(new Error(secret), {
      status: 403,
      stack: `Error: ${secret}\n${stackFrame}`,
      response: {
        req: { _header: `Authorization: Bearer ${secret}` },
        headers: { 'set-cookie': secret },
        body: { access_token: secret },
      },
    })
    Object.assign(error, { cause: error, request: error })
    const output = new PassThrough()
    const log = bunyan.createLogger({
      name: 'test',
      stream: bunyanFormat({ outputMode: 'short', color: false }, output),
    })

    log.error(errorLogFields(error), 'API request failed')

    const formatted = output.read().toString()
    expect(formatted).toContain('status=403')
    expect(formatted).toContain(stackFrame)
    expect(formatted).not.toContain(secret)
    expect(errorLogFields(error)).toEqual({ status: 403, stack: stackFrame })
  })
})
