import { auditService } from '@ministryofjustice/hmpps-audit-client'
import { audit, auditWithSubject } from './sendAuditMessage'
import { AuditEvent } from './auditEvent'
import { AuditSubjectType } from './auditSubjectType'
import config from '../config'

jest.mock('@ministryofjustice/hmpps-audit-client', () => ({
  auditService: {
    sendAuditMessage: jest.fn(),
  },
}))

jest.mock('uuid', () => ({
  v4: () => 'correlationId',
}))

describe('audit function', () => {
  const username = 'testUser'
  const auditEvent = AuditEvent.VIEW_REPORT_LIST_ATTEMPT
  const { serviceAccountName } = config

  it('should call sendAuditMessage with correct parameters when minimal audit is called', async () => {
    const auditFunction = audit(username)
    await auditFunction(auditEvent)

    expect(auditService.sendAuditMessage).toHaveBeenCalledWith({
      action: auditEvent,
      who: username,
      subjectId: null,
      subjectType: null,
      correlationId: 'correlationId',
      service: serviceAccountName,
      details: null,
    })
  })

  it('should call sendAuditMessage with details', async () => {
    const details = { test: 'details' }

    const auditFunction = audit(username, details)
    await auditFunction(auditEvent)

    expect(auditService.sendAuditMessage).toHaveBeenCalledWith({
      action: auditEvent,
      who: username,
      subjectId: null,
      subjectType: null,
      correlationId: 'correlationId',
      service: serviceAccountName,
      details: '{"test":"details"}',
    })
  })
})

describe('auditWithSubject function', () => {
  const username = 'testUser'
  const manageUsersEvent = AuditEvent.VIEW_REPORT_LIST_ATTEMPT
  const { serviceAccountName } = config
  const subjectId = 'testSubjectId'
  const subjectType = AuditSubjectType.USER_ID

  it('should call sendAuditMessage with correct parameters when minimal audit is called', async () => {
    const auditFunction = auditWithSubject(username, subjectId, subjectType)
    await auditFunction(manageUsersEvent)

    expect(auditService.sendAuditMessage).toHaveBeenCalledWith({
      action: manageUsersEvent,
      who: username,
      subjectId,
      subjectType: 'USER_ID',
      correlationId: 'correlationId',
      service: serviceAccountName,
      details: null,
    })
  })

  it('should call sendAuditMessage with details', async () => {
    const details = { test: 'details' }

    const auditFunction = auditWithSubject(username, subjectId, subjectType, details)
    await auditFunction(manageUsersEvent)

    expect(auditService.sendAuditMessage).toHaveBeenCalledWith({
      action: manageUsersEvent,
      who: username,
      subjectId,
      subjectType: 'USER_ID',
      correlationId: 'correlationId',
      service: serviceAccountName,
      details: '{"test":"details"}',
    })
  })
})
