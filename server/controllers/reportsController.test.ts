import type { Request, Response } from 'express'
import nock from 'nock'
import ReportsController from './reportsController'
import config from '../config'
import type { SubjectAccessRequest } from '../@types/subjectAccessRequest'

let fakeApi: nock.Scope

const subjectAccessRequests: SubjectAccessRequest[] = [
  {
    id: 'aaaaaaaa-cb77-4c0e-a4de-1efc0e86ff34',
    status: 'Pending',
    dateFrom: '2024-03-01',
    dateTo: '2024-03-12',
    sarCaseReferenceNumber: 'caseRef1',
    services:
      'hmpps-activities-management-api, https://activities-api-dev.prison.service.justice.gov.uk,keyworker-api, https://keyworker-api-dev.prison.service.justice.gov.uk,hmpps-manage-adjudications-api, https://manage-adjudications-api-dev.hmpps.service.justice.gov.uk',
    nomisId: '',
    ndeliusCaseReferenceId: 'A123456',
    requestedBy: 'user',
    requestDateTime: '2024-03-12T13:52:40.14177',
    claimDateTime: '2024-03-27T14:49:08.67033',
    claimAttempts: 1,
    objectUrl: null,
    lastDownloaded: null,
  },
  {
    id: 'bbbbbbbb-cb77-4c0e-a4de-1efc0e86ff34',
    status: 'Completed',
    dateFrom: '2023-03-01',
    dateTo: '2023-03-12',
    sarCaseReferenceNumber: 'caseRef2',
    services:
      'hmpps-activities-management-api, https://activities-api-dev.prison.service.justice.gov.uk,keyworker-api, https://keyworker-api-dev.prison.service.justice.gov.uk,hmpps-manage-adjudications-api, https://manage-adjudications-api-dev.hmpps.service.justice.gov.uk',
    nomisId: '',
    ndeliusCaseReferenceId: 'A123456',
    requestedBy: 'user',
    requestDateTime: '2023-03-12T13:52:40.14177',
    claimDateTime: '2023-03-27T14:49:08.67033',
    claimAttempts: 1,
    objectUrl: null,
    lastDownloaded: null,
  },
  {
    id: 'cccccccc-cb77-4c0e-a4de-1efc0e86ff34',
    status: 'Completed',
    dateFrom: '2022-03-01',
    dateTo: '2022-03-12',
    sarCaseReferenceNumber: 'caseRef3',
    services:
      'hmpps-activities-management-api, https://activities-api-dev.prison.service.justice.gov.uk,keyworker-api, https://keyworker-api-dev.prison.service.justice.gov.uk,hmpps-manage-adjudications-api, https://manage-adjudications-api-dev.hmpps.service.justice.gov.uk',
    nomisId: '',
    ndeliusCaseReferenceId: 'A123456',
    requestedBy: 'user',
    requestDateTime: '2022-03-12T13:52:40.14177',
    claimDateTime: '2022-03-27T14:49:08.67033',
    claimAttempts: 1,
    objectUrl: null,
    lastDownloaded: null,
  },
]

beforeEach(() => {
  fakeApi = nock(config.apis.subjectAccessRequest.url)

  ReportsController.getSubjectAccessRequestList = jest.fn().mockReturnValue({
    subjectAccessRequests,
    numberOfReports: 3,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('getReports', () => {
  let req: Request = {
    // @ts-expect-error stubbing session
    session: {},
    query: {},
    user: {
      token: 'fakeUserToken',
      authSource: 'auth',
    },
  }
  // @ts-expect-error stubbing res.render
  const res: Response = {
    render: jest.fn(),
    set: jest.fn(),
    send: jest.fn(),
  }
  test('renders a response with list of SAR reports', async () => {
    await ReportsController.getReports(req, res)
    expect(res.render).toBeCalledWith(
      'pages/reports',
      expect.objectContaining({
        reportList: [
          {
            uuid: 'aaaaaaaa-cb77-4c0e-a4de-1efc0e86ff34',
            status: 'Pending',
            sarCaseReference: 'caseRef1',
            subjectId: 'A123456',
            dateOfRequest: '12/03/2024, 13:52',
            lastDownloaded: '',
          },
          {
            uuid: 'bbbbbbbb-cb77-4c0e-a4de-1efc0e86ff34',
            status: 'Completed',
            sarCaseReference: 'caseRef2',
            subjectId: 'A123456',
            dateOfRequest: '12/03/2023, 13:52',
            lastDownloaded: '',
          },
          {
            uuid: 'cccccccc-cb77-4c0e-a4de-1efc0e86ff34',
            status: 'Completed',
            sarCaseReference: 'caseRef3',
            subjectId: 'A123456',
            dateOfRequest: '12/03/2022, 13:52',
            lastDownloaded: '',
          },
        ],
      }),
    )
  })

  describe('pagination', () => {
    beforeEach(() => {
      ReportsController.getSubjectAccessRequestList = jest.fn().mockReturnValue({
        subjectAccessRequests: [],
        numberOfReports: 240,
      })
    })
    describe('when the current page is the first page', () => {
      test('previous will be 0 and so will not appear', async () => {
        await ReportsController.getReports(req, res)
        expect(res.render).toBeCalledWith(
          'pages/reports',
          expect.objectContaining({
            previous: 0,
          }),
        )
      })

      test('next directs to second page', async () => {
        await ReportsController.getReports(req, res)
        expect(res.render).toBeCalledWith(
          'pages/reports',
          expect.objectContaining({
            next: 2,
          }),
        )
      })

      test('from gives the first number of the range of displayed results on the page', async () => {
        await ReportsController.getReports(req, res)
        expect(res.render).toBeCalledWith(
          'pages/reports',
          expect.objectContaining({
            from: 1,
          }),
        )
      })

      test('to gives the last number of the range of displayed results on the page', async () => {
        await ReportsController.getReports(req, res)
        expect(res.render).toBeCalledWith(
          'pages/reports',
          expect.objectContaining({
            to: 50,
          }),
        )
      })

      test('numberOfReports gives the total number of reports', async () => {
        await ReportsController.getReports(req, res)
        expect(res.render).toBeCalledWith(
          'pages/reports',
          expect.objectContaining({
            numberOfReports: 240,
          }),
        )
      })
    })

    describe('when the current page is the fifth page', () => {
      beforeEach(() => {
        req = {
          // @ts-expect-error stubbing session
          session: {},
          query: { page: '5' },
        }
      })
      test('previous directs to the fourth page', async () => {
        await ReportsController.getReports(req, res)
        expect(res.render).toBeCalledWith(
          'pages/reports',
          expect.objectContaining({
            previous: 4,
          }),
        )
      })

      test('next will be 0 and so will not appear', async () => {
        await ReportsController.getReports(req, res)
        expect(res.render).toBeCalledWith(
          'pages/reports',
          expect.objectContaining({
            next: 0,
          }),
        )
      })

      test('from gives the first number of the range of displayed results on the page', async () => {
        await ReportsController.getReports(req, res)
        expect(res.render).toBeCalledWith(
          'pages/reports',
          expect.objectContaining({
            from: 201,
          }),
        )
      })

      test('to gives the last number of the range of displayed results on the page', async () => {
        await ReportsController.getReports(req, res)
        expect(res.render).toBeCalledWith(
          'pages/reports',
          expect.objectContaining({
            to: 240,
          }),
        )
      })

      test('numberOfReports gives the total number of reports', async () => {
        await ReportsController.getReports(req, res)
        expect(res.render).toBeCalledWith(
          'pages/reports',
          expect.objectContaining({
            numberOfReports: 240,
          }),
        )
      })
    })

    describe('when the current page is the third page', () => {
      beforeEach(() => {
        req = {
          // @ts-expect-error stubbing session
          session: {},
          query: { page: '3', id: 'df936446-719a-4463-acb6-9b13eea1f495' },
          user: {
            token: 'fakeUserToken',
            authSource: 'auth',
          },
        }
      })
      test('previous directs to the second page', async () => {
        await ReportsController.getReports(req, res)
        expect(res.render).toBeCalledWith(
          'pages/reports',
          expect.objectContaining({
            previous: 2,
          }),
        )
      })

      test('next directs to fourth page', async () => {
        await ReportsController.getReports(req, res)
        expect(res.render).toBeCalledWith(
          'pages/reports',
          expect.objectContaining({
            next: 4,
          }),
        )
      })

      test('from gives the first number of the range of displayed results on the page', async () => {
        await ReportsController.getReports(req, res)
        expect(res.render).toBeCalledWith(
          'pages/reports',
          expect.objectContaining({
            from: 101,
          }),
        )
      })

      test('to gives the last number of the range of displayed results on the page', async () => {
        await ReportsController.getReports(req, res)
        expect(res.render).toBeCalledWith(
          'pages/reports',
          expect.objectContaining({
            to: 150,
          }),
        )
      })

      test('numberOfReports gives the total number of reports', async () => {
        await ReportsController.getReports(req, res)
        expect(res.render).toBeCalledWith(
          'pages/reports',
          expect.objectContaining({
            numberOfReports: 240,
          }),
        )
      })
    })
  })

  describe('report info', () => {
    test('getSubjectAccessRequestList gets correct response', async () => {
      fakeApi.get('/api/subjectAccessRequests?pageSize=50&pageNumber=1&search=').reply(200, [
        {
          id: 'aaaaaaaa-cb77-4c0e-a4de-1efc0e86ff34',
          status: 'Pending',
          dateFrom: '2024-03-01',
          dateTo: '2024-03-12',
          sarCaseReferenceNumber: 'caseRef1',
          services:
            'hmpps-activities-management-api, https://activities-api-dev.prison.service.justice.gov.uk,keyworker-api, https://keyworker-api-dev.prison.service.justice.gov.uk,hmpps-manage-adjudications-api, https://manage-adjudications-api-dev.hmpps.service.justice.gov.uk',
          nomisId: '',
          ndeliusCaseReferenceId: 'A123456',
          requestedBy: 'user',
          requestDateTime: '2024-03-12T13:52:40.14177',
          claimDateTime: '2024-03-27T14:49:08.67033',
          claimAttempts: 1,
          objectUrl: null,
        },
        {
          id: 'bbbbbbbb-cb77-4c0e-a4de-1efc0e86ff34',
          status: 'Completed',
          dateFrom: '2023-03-01',
          dateTo: '2023-03-12',
          sarCaseReferenceNumber: 'caseRef2',
          services:
            'hmpps-activities-management-api, https://activities-api-dev.prison.service.justice.gov.uk,keyworker-api, https://keyworker-api-dev.prison.service.justice.gov.uk,hmpps-manage-adjudications-api, https://manage-adjudications-api-dev.hmpps.service.justice.gov.uk',
          nomisId: '',
          ndeliusCaseReferenceId: 'A123456',
          requestedBy: 'user',
          requestDateTime: '2023-03-12T13:52:40.14177',
          claimDateTime: '2023-03-27T14:49:08.67033',
          claimAttempts: 1,
          objectUrl: null,
        },
        {
          id: 'cccccccc-cb77-4c0e-a4de-1efc0e86ff34',
          status: 'Completed',
          dateFrom: '2022-03-01',
          dateTo: '2022-03-12',
          sarCaseReferenceNumber: 'caseRef3',
          services:
            'hmpps-activities-management-api, https://activities-api-dev.prison.service.justice.gov.uk,keyworker-api, https://keyworker-api-dev.prison.service.justice.gov.uk,hmpps-manage-adjudications-api, https://manage-adjudications-api-dev.hmpps.service.justice.gov.uk',
          nomisId: '',
          ndeliusCaseReferenceId: 'A123456',
          requestedBy: 'user',
          requestDateTime: '2022-03-12T13:52:40.14177',
          claimDateTime: '2022-03-27T14:49:08.67033',
          claimAttempts: 1,
          objectUrl: null,
        },
      ])
      const response = await ReportsController.getSubjectAccessRequestList(req, '1')
      expect(response.numberOfReports).toBe(3)
    })
  })

  describe('newGetSubjectAccessRequestList', () => {
    test('newGetSubjectAccessRequestList gets correct response', async () => {
      fakeApi.get('/api/subjectAccessRequests?pageSize=50&pageNumber=0&search=').reply(200, subjectAccessRequests)
      fakeApi.get('/api/totalSubjectAccessRequests').reply(200, '3')

      const response = await ReportsController.getSubjectAccessRequestList(req, '1')

      expect(response.numberOfReports).toBe(3)
    })
  })

  describe('getCondensedSarList', () => {
    test('getCondensedSarList returns list of SARs with condensed information for display', async () => {
      const condensedSarList = [
        {
          uuid: 'aaaaaaaa-cb77-4c0e-a4de-1efc0e86ff34',
          status: 'Pending',
          sarCaseReference: 'caseRef1',
          subjectId: 'A123456',
          dateOfRequest: '12/03/2024, 13:52',
          lastDownloaded: '',
        },
        {
          uuid: 'bbbbbbbb-cb77-4c0e-a4de-1efc0e86ff34',
          status: 'Completed',
          sarCaseReference: 'caseRef2',
          subjectId: 'A123456',
          dateOfRequest: '12/03/2023, 13:52',
          lastDownloaded: '',
        },
        {
          uuid: 'cccccccc-cb77-4c0e-a4de-1efc0e86ff34',
          status: 'Completed',
          sarCaseReference: 'caseRef3',
          subjectId: 'A123456',
          dateOfRequest: '12/03/2022, 13:52',
          lastDownloaded: '',
        },
      ]

      const response = ReportsController.getCondensedSarList(subjectAccessRequests)

      expect(response).toStrictEqual(condensedSarList)
    })
  })

  describe('getFormattedDateTime', () => {
    test('returns dateTime custom formatted', () => {
      const dateTimeString = '2024-07-30T10:19:20.785075'
      const expectedFormattedDateTime = '30/07/2024, 10:19'

      const formattedDateTime = ReportsController.getFormattedDateTime(dateTimeString)

      expect(formattedDateTime).toEqual(expectedFormattedDateTime)
    })

    test('returns null if dateTime is null', () => {
      const dateTimeString: string = null

      const formattedDateTime = ReportsController.getFormattedDateTime(dateTimeString)

      expect(formattedDateTime).toEqual(null)
    })
  })
})
