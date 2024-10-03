import { v4 as uuidv4 } from 'uuid'
import { auditService } from '@ministryofjustice/hmpps-audit-client'
import config from '../config'
import logger from '../../logger'
import { AuditEvent } from './auditEvent'
import { AuditSubjectType } from './auditSubjectType'

const sendAuditMessage = async (
  auditEvent: AuditEvent,
  username: string,
  subjectId: string,
  subjectType: AuditSubjectType,
  details: Record<string, unknown>,
  correlationId: string,
) => {
  if (!config.apis.audit.enabled) {
    logger.info(`${auditEvent} - ${username} - ${subjectId} - ${subjectType} - ${JSON.stringify(details)}`)
  } else {
    const auditMessage = {
      action: auditEvent,
      who: username,
      subjectId,
      subjectType,
      correlationId,
      service: config.serviceAccountName || config.productId,
      details: details ? JSON.stringify(details) : null,
    }
    await auditService.sendAuditMessage(auditMessage)
  }
}

export const audit = (username: string, details?: Record<string, unknown>): AuditFunction => {
  const correlationId = uuidv4()
  return async (auditEvent: AuditEvent) => {
    await sendAuditMessage(auditEvent, username, null, null, details, correlationId)
  }
}

export const auditWithSubject = (
  username: string,
  subjectId: string,
  subjectType: AuditSubjectType,
  details?: Record<string, unknown>,
): AuditFunction => {
  const correlationId = uuidv4()
  return async (auditEvent: AuditEvent) => {
    await sendAuditMessage(auditEvent, username, subjectId, subjectType, details, correlationId)
  }
}

export type AuditFunction = (auditEvent: AuditEvent) => Promise<void>
