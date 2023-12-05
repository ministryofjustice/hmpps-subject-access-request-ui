
| Field | Data type | Description | Default value | Possible values
| --- | --- | --- | --- | --- |
| status | varchar, not null | | Pending | Pending, Completed |
| id (primary key) | integer, not null | report ID | | |
| dateFrom | date | | | |
| dateTo | date, not null | | Today's date | |
| sarCaseReferenceNumber | varchar, not null | | | |
| services | Array, not null | | | |
| nomisId | varchar, not null if ndeliusCaseReferenceId and hmmpsId are null | | | |
| ndeliusCaseReferenceId | varchar, not null if nomisId and hmmpsId are null | | | |
| hmmpsId | varchar, not null if ndeliusCaseReferenceId and nomisId are null | | | |
| subject | varchar, not null | Name of requestee/offender/person about whom the SAR report is requested| | |
| requestor/requestedBy | varchar, not null | Member of SAR team who requested the report | | |
| requestDateByRequestor/requestDateBySar | timestamp, not null | | Today's date and time| |
| claimDateTime | timestamp | | | |
| objectURL | varchar | | | |
| presignedURL | varchar | | | |
| claimAttempts | smallint | | 0 | |
