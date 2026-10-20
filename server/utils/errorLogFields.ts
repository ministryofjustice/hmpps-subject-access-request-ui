interface ErrorLogFields {
  status?: number
  stack?: string
}

export default function errorLogFields(error: unknown): ErrorLogFields {
  if (typeof error !== 'object' || error === null) {
    return {}
  }

  const fields: ErrorLogFields = {}
  if ('status' in error && typeof error.status === 'number' && Number.isFinite(error.status)) {
    fields.status = error.status
  }
  if ('stack' in error && typeof error.stack === 'string') {
    const frames = error.stack
      .slice(0, 65536)
      .split('\n')
      .slice(1)
      .filter(line => /^\s+at /.test(line))
      .slice(0, 20)
    if (frames.length) fields.stack = frames.join('\n')
  }
  return fields
}
