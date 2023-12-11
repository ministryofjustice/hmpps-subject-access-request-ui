
| Field | Data type | Description | Default value | Possible values
| --- | --- | --- | --- | --- |
| status | varchar, not null | | Pending | Pending, Completed |
| id (primary key) | integer, not null | report ID | | |
| dateFrom | date | | | |
| dateTo | date, not null | | Today's date | |
| sarCaseReferenceNumber | varchar, not null | Reference number from SAR case management service to link the SAR report with the original SAR request | | |
| services | array, not null | List of services from which data is collected to generate the SAR report| | |
| nomisId | varchar, not null if ndeliusCaseReferenceId and hmmpsId are null | | | |
| ndeliusCaseReferenceId | varchar, not null if nomisId and hmmpsId are null | | | |
| hmmpsId | varchar, not null if ndeliusCaseReferenceId and nomisId are null | | | |
| subject | varchar, not null | Name of requestee/offender/person about whom the SAR report is requested| | |
| requestedBy | varchar, not null | Member of SAR team who requested the SAR report | | |
| requestDateTime | timestamp, not null | | Today's date and time| |
| claimDateTime | timestamp | Time SAR report request is picked up by a worker | | |
| objectURL | varchar | S3 URL to PDF object | | |
| presignedURL | varchar |S3 pre-signed URL link to PDF | | |
| claimAttempts | smallint | Record of how many times a SAR report request has been claimed, for monitoring/alerting purposes | 0 | |
