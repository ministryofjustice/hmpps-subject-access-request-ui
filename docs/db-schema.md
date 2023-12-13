
| Field | Data type | Description | Default value | Possible values
| --- | --- | --- | --- | --- |
| status | enum, not null | | Pending | Pending, Completed |
| id (primary key) | integer, not null | report ID | | |
| date_from | date | | | |
| date_to | date, not null | | Today's date | |
| sar_case_reference_number | text, not null | Reference number from SAR case management service to link the SAR report with the original SAR request | | |
| services | text array, not null | List of services from which data is collected to generate the SAR report| | |
| nomis_id | text | Reference number for prison cases | | |
| ndelius_case_reference_id | text | Reference number for probation cases | | |
| hmpps_id | text | Soon-to-be-implemented single reference number covering both prison and probation cases | | |
| subject | text, not null | Name of requestee/offender/person about whom the SAR report is requested| | |
| requested_by | text, not null | Member of SAR team who requested the SAR report | | |
| request_date_time | timestamp, not null | | Today's date and time| |
| claim_date_time | timestamp | Time SAR report request is picked up by a worker | | |
| object_url | text | S3 URL to PDF object | | |
| presigned_url | text | S3 pre-signed URL link to PDF | | |
| claim_attempts | smallint | Record of how many times a SAR report request has been claimed, for monitoring/alerting purposes | 0 | |
