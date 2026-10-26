interface ErrorLogFields {
  status?: number
  stack?: string
}

const MAX_STACK_LENGTH = 65536
const MAX_STACK_FRAMES = 20

export default function errorLogFields(error: unknown): ErrorLogFields {
  if (typeof error !== 'object' || error === null) {
    return {}
  }

  const fields: ErrorLogFields = {}
  if ('status' in error && typeof error.status === 'number' && Number.isFinite(error.status)) {
    fields.status = error.status
  }
  if (
    'stack' in error &&
    typeof error.stack === 'string' &&
    'name' in error &&
    typeof error.name === 'string' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    const header = error.name && error.message ? `${error.name}: ${error.message}` : error.name || error.message
    const prefix = `${header}\n`
    if (!error.stack.startsWith(prefix)) return fields

    const frames = error.stack
      .slice(0, MAX_STACK_LENGTH)
      .slice(prefix.length)
      .split('\n')
      .filter(line => /^\s+at /.test(line))
      .slice(0, MAX_STACK_FRAMES)
    if (frames.length) fields.stack = frames.join('\n')
  }
  return fields
}
