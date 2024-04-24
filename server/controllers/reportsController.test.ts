import type { Request, Response } from 'express'
import nock from 'nock'
import ReportsController from './reportsController'
import config from '../config'

let fakeApi: nock.Scope

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
  }
  // @ts-expect-error stubbing res.render
  const res: Response = {
    render: jest.fn(),
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
          query: { page: '3' },
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
      const response = await ReportsController.getSubjectAccessRequestList(req)
      expect(response.numberOfReports).toBe(3)
    })

    test('downloadReport returns byte array and takes an ID', async () => {
      const testUUID = 'df936446-719a-4463-acb6-9b13eea1f495'
      const response = await ReportsController.downloadReport(testUUID)
      expect(response).toBeInstanceOf(Uint8Array)
    })
  })
})
