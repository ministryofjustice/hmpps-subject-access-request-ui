import { v4 as uuidv4 } from 'uuid'
import { auditService } from '@ministryofjustice/hmpps-audit-client'
import config from '../config'
import logger from '../../logger'
import { AuditEvent } from './auditEvent'
import { AuditSubjectType } from './auditSubjectType'

const sendAuditMessage = async (
  manageUsersEvent: AuditEvent,
  username: string,
  subjectId: string,
  subjectType: AuditSubjectType,
  details: Record<string, unknown>,
  correlationId: string,
) => {
  if (!config.apis.audit.enabled) {
    logger.info(`${manageUsersEvent} - ${username} - ${subjectId} - ${subjectType} - ${JSON.stringify(details)}`)
  } else {
    const auditMessage = {
      action: manageUsersEvent,
      who: username,
      subjectId,
      subjectType,
      correlationId,
      service: config.productId,
      details: details ? JSON.stringify(details) : null,
    }
    await auditService.sendAuditMessage(auditMessage)
  }
}

export const audit = (username: string, details?: Record<string, unknown>): AuditFunction => {
  const correlationId = uuidv4()
  return async (manageUsersEvent: AuditEvent) => {
    await sendAuditMessage(manageUsersEvent, username, null, null, details, correlationId)
  }
}

export const auditWithSubject = (
  username: string,
  subjectId: string,
  subjectType: AuditSubjectType,
  details?: Record<string, unknown>,
): AuditFunction => {
  const correlationId = uuidv4()
  return async (manageUsersEvent: AuditEvent) => {
    await sendAuditMessage(manageUsersEvent, username, subjectId, subjectType, details, correlationId)
  }
}

export type AuditFunction = (manageUsersEvent: AuditEvent) => Promise<void>
