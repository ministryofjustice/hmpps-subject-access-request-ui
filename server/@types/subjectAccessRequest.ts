export interface SubjectAccessRequest {
  id: string
  status: string
  dateFrom: string
  dateTo: string
  sarCaseReferenceNumber: string
  services: Array<RequestService>
  nomisId: string
  ndeliusCaseReferenceId: string
  requestedBy: string
  requestDateTime: string
  claimDateTime: string
  claimAttempts: number
  objectUrl: string | null
  lastDownloaded: string
}

export interface RequestService {
  serviceName: string
  renderStatus: string
  templateVersion?: string
  renderedAt?: string
}

export interface AdminSubjectAccessRequest extends SubjectAccessRequest {
  durationHumanReadable: string | null
  appInsightsEventsUrl: string | null
}
