import type { Request, Response } from 'express'
import ReportDownloadController from './reportDownloadController'
import formatDate from '../utils/dateHelpers'

afterEach(() => {
  jest.resetAllMocks()
})

describe('getReport', () => {
  test('creates a fileName from request query parameters', async () => {
    // @ts-expect-error stubbing res.set
    const res: Response = {
      set: jest.fn(),
      send: jest.fn(),
    }
    const req: Request = {
      // @ts-expect-error stubbing session
      session: {},
      query: {
        id: 'mock-file-ID',
        sarCaseReference: 'mock-sar-case-reference',
        subjectId: 'mock-subject-ID',
      },
    }
    const next = jest.fn()
    const date = formatDate(new Date().toISOString(), 'short')

    await ReportDownloadController.getReport(req, res, next)

    expect(res.set).toHaveBeenCalled()
    expect(res.set).toHaveBeenCalledWith(
      'Content-Disposition',
      `attachment;filename="subject-access-request-report-${date}-mock-sar-case-reference-mock-subject-ID"`,
    )
  })
})
