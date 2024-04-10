import type { Request, Response } from 'express'
import getPageLinks from '../utils/paginationHelper'

const RESULTSPERPAGE = 50

export default class ReportsController {
  static getSubjectAccessRequestList() {
    const numberOfReports = 500

    const reports = [
      {
        uuid: 'ae6f396d-f1b1-460b-8d13-9a5f3e569c1a',
        dateOfRequest: '2024-12-01',
        sarCaseReference: '1-casereference',
        subjectId: 'A1234AA',
        status: 'Pending',
      },
      {
        uuid: '1e130369-f3fb-46ab-8855-abd621d0b032',
        dateOfRequest: '2023-07-30',
        sarCaseReference: '2-casereference',
        subjectId: 'B2345BB',
        status: 'Completed',
      },
      {
        uuid: '756689d0-4a0b-405c-bf0c-312f11f9f1b7',
        dateOfRequest: '2022-12-30',
        sarCaseReference: '3-casereference',
        subjectId: 'C3456CC',
        status: 'Completed',
      },
    ]
    return { reports, numberOfReports }
  }

  static getReports(req: Request, res: Response) {
    const { reports, numberOfReports } = ReportsController.getSubjectAccessRequestList()
    const currentPage = (req.query.page || '1') as string
    const parsedPage = Number.parseInt(currentPage, 10) || 1
    const visiblePageLinks = 5
    const numberOfPages = Math.ceil(numberOfReports / RESULTSPERPAGE)

    const previous = parsedPage - 1
    const next = parsedPage === numberOfPages ? 0 : parsedPage + 1

    const from = (parsedPage - 1) * RESULTSPERPAGE + 1
    const to = Math.min(parsedPage * RESULTSPERPAGE, numberOfReports)

    const pageLinks = getPageLinks({ visiblePageLinks, numberOfPages, currentPage: parsedPage })

    res.render('pages/reports', {
      reportList: reports,
      pageLinks,
      previous,
      next,
      from,
      to,
      numberOfReports,
    })
  }
}
