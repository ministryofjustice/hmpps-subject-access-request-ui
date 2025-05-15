export interface Report {
  uuid: string
  dateOfRequest: string
  sarCaseReference: string
  subjectId: string
  status: string
}

export interface AdminReport extends Report {
  uuid: string
  dateOfRequest: string
  sarCaseReference: string
  subjectId: string
  status: string
}
