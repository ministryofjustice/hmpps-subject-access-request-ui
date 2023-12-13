
| Field | Data type | Description | Default value | Possible values
| --- | --- | --- | --- | --- |
| status | enum | | Pending | Pending, Completed |
| id (primary key) | integer, not null | report ID | | |
| dateFrom | date | | | |
| dateTo | date, not null | | Today's date | |
| sarCaseReferenceNumber | text, not null | Reference number from SAR case management service to link the SAR report with the original SAR request | | |
| services | text array, not null | List of services from which data is collected to generate the SAR report| | |
| nomisId | text, not null if ndeliusCaseReferenceId and hmmpsId are null | Reference number for prison cases | | |
| ndeliusCaseReferenceId | text, not null if nomisId and hmmpsId are null | Reference number for probation cases | | |
| hmmpsId | text, not null if ndeliusCaseReferenceId and nomisId are null | Soon-to-be-implemented single reference number covering both prison and probation cases | | |
| subject | text, not null | Name of requestee/offender/person about whom the SAR report is requested| | |
| requestedBy | text, not null | Member of SAR team who requested the SAR report | | |
| requestDateTime | timestamp, not null | | Today's date and time| |
| claimDateTime | timestamp | Time SAR report request is picked up by a worker | | |
| objectURL | text | S3 URL to PDF object | | |
| presignedURL | text | S3 pre-signed URL link to PDF | | |
| claimAttempts | smallint | Record of how many times a SAR report request has been claimed, for monitoring/alerting purposes | 0 | |
