import { AuditEvent } from '../audit'

// eslint-disable-next-line import/prefer-default-export, @typescript-eslint/no-explicit-any
export const auditAction = (action: AuditEvent): any => expect.objectContaining({ action })
