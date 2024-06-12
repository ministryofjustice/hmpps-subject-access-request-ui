import type { Request, Response } from 'express'
import nock from 'nock'
import ReportsController from './reportsController'
import config from '../config'
import { sub } from 'date-fns'

let fakeApi: nock.Scope

const subjectAccessRequests: any = [
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
]

beforeEach(() => {
  fakeApi = nock(config.apis.subjectAccessRequest.url)

  ReportsController.getSubjectAccessRequestList = jest.fn().mockReturnValue({
    reports: [
      {
        uuid: 'ae6f396d-f1b1-460b-8d13-9a5f3e569c1a',
        dateOfRequest: '2024-12-20',
        sarCaseReference: 'example1',
        subjectId: 'B1234AA',
        status: 'Pending',
      },
      {
        uuid: '1e130369-f3fb-46ab-8855-abd621d0b032',
        dateOfRequest: '2023-01-19',
        sarCaseReference: 'example2',
        subjectId: 'C2345BB',
        status: 'Completed',
      },
      {
        uuid: '756689d0-4a0b-405c-bf0c-312f11f9f1b7',
        dateOfRequest: '2022-16-18',
        sarCaseReference: 'example3',
        subjectId: 'D3456CC',
        status: 'Completed',
      },
    ],
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
            dateOfRequest: '2024-12-20',
            sarCaseReference: 'example1',
            status: 'Pending',
            subjectId: 'B1234AA',
            uuid: 'ae6f396d-f1b1-460b-8d13-9a5f3e569c1a',
          },
          {
            dateOfRequest: '2023-01-19',
            sarCaseReference: 'example2',
            status: 'Completed',
            subjectId: 'C2345BB',
            uuid: '1e130369-f3fb-46ab-8855-abd621d0b032',
          },
          {
            dateOfRequest: '2022-16-18',
            sarCaseReference: 'example3',
            status: 'Completed',
            subjectId: 'D3456CC',
            uuid: '756689d0-4a0b-405c-bf0c-312f11f9f1b7',
          },
        ],
      }),
    )
  })

  describe('pagination', () => {
    beforeEach(() => {
      ReportsController.getSubjectAccessRequestList = jest.fn().mockReturnValue({
        reports: [],
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
  // TODO: 
  // - Remove this test
  // I don't believe this is testing properly - I believe its using the mocked info at the top of the file rather than below - and the zero indexing isnt being checked properly
  describe('report info', () => {
    test('getSubjectAccessRequestList gets correct response', async () => {
      fakeApi.get('/api/reports?pageSize=50&pageNumber=1').reply(200, [
        {
          uuid: 'ae6f396d-f1b1-460b-8d13-9a5f3e569c1a',
          dateOfRequest: '2024-12-20',
          sarCaseReference: 'example1',
          subjectId: 'B1234AA',
          status: 'Pending',
        },
        {
          uuid: '1e130369-f3fb-46ab-8855-abd621d0b032',
          dateOfRequest: '2023-01-19',
          sarCaseReference: 'example2',
          subjectId: 'C2345BB',
          status: 'Completed',
        },
        {
          uuid: '756689d0-4a0b-405c-bf0c-312f11f9f1b7',
          dateOfRequest: '2022-16-18',
          sarCaseReference: 'example3',
          subjectId: 'D3456CC',
          status: 'Completed',
        },
      ])
      const response = await ReportsController.getSubjectAccessRequestList(req, '1')
      expect(response.numberOfReports).toBe(3)
    })
  })

  describe('newGetSubjectAccessRequestList', () => {
    test('newGetSubjectAccessRequestList gets correct response', async () => {
      fakeApi.get('/api/subjectAccessRequests?pageSize=50&pageNumber=0').reply(200, subjectAccessRequests)
      fakeApi.get('/api/totalSubjectAccessRequests').reply(200, '3')

      const response = await ReportsController.newGetSubjectAccessRequestList(req, '1')

      expect(response.numberOfReports).toBe('3')
    })
  })

  describe('getCondensedSarList', () => {
    test('getCondensedSarList returns list of SARs with condensed information for display', async () => {
      const condensedSarList = [
        {
          id: 'aaaaaaaa-cb77-4c0e-a4de-1efc0e86ff34',
          status: 'Pending',
          sarCaseReferenceNumber: 'caseRef1',
          subjectId: 'A123456',
          requestDateTime: '2024-03-12T13:52:40.14177',
        },
        {
          id: 'bbbbbbbb-cb77-4c0e-a4de-1efc0e86ff34',
          status: 'Completed',
          sarCaseReferenceNumber: 'caseRef2',
          ndeliusCaseReferenceId: 'A123456',
          requestDateTime: '2023-03-12T13:52:40.14177',
        },
        {
          id: 'cccccccc-cb77-4c0e-a4de-1efc0e86ff34',
          status: 'Completed',
          sarCaseReferenceNumber: 'caseRef3',
          ndeliusCaseReferenceId: 'A123456',
          requestDateTime: '2022-03-12T13:52:40.14177',
        },
      ]

      const response = ReportsController.getCondensedSarList(subjectAccessRequests)

      expect(response).toBe(condensedSarList)
    })
  })
})
