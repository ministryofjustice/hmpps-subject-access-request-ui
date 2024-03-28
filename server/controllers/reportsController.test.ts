import type { Request, Response } from 'express'
import ReportsController from './reportsController'

beforeEach(() => {
  ReportsController.getSubjectAccessRequestList = jest.fn().mockReturnValue([
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
      status: 'Complete',
    },
    {
      uuid: '756689d0-4a0b-405c-bf0c-312f11f9f1b7',
      dateOfRequest: '2022-16-18',
      sarCaseReference: 'example3',
      subjectId: 'D3456CC',
      status: 'Complete',
    },
  ])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('getReports', () => {
  const req: Request = {
    // @ts-expect-error stubbing session
    session: {},
  }
  // @ts-expect-error stubbing res.render
  const res: Response = {
    render: jest.fn(),
  }
  test('renders a response with list of SAR reports', () => {
    ReportsController.getReports(req, res)
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
            status: 'Complete',
            subjectId: 'C2345BB',
            uuid: '1e130369-f3fb-46ab-8855-abd621d0b032',
          },
          {
            dateOfRequest: '2022-16-18',
            sarCaseReference: 'example3',
            status: 'Complete',
            subjectId: 'D3456CC',
            uuid: '756689d0-4a0b-405c-bf0c-312f11f9f1b7',
          },
        ],
      }),
    )
  })
})
