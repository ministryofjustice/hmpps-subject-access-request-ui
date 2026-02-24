import jwt from 'jsonwebtoken'
import { AuditEvent } from '../audit'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const auditAction = (action: AuditEvent): any => expect.objectContaining({ action })

export function createUserToken(authorities: string[]) {
  const payload = {
    user_name: 'user1',
    scope: ['read', 'write'],
    auth_source: 'nomis',
    authorities,
    jti: 'a610a10-cca6-41db-985f-e87efb303aaf',
    client_id: 'clientid',
  }

  return jwt.sign(payload, 'secret', { expiresIn: '1h' })
}
