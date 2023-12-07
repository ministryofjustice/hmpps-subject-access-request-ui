import { Request, Response } from 'express'

export default class SummaryController {
  static getReportDetails(req: Request, res: Response) {
    const selectedList = req.session.selectedList ?? []
    const userData = req.session.userData ?? {}

    const dateFrom = userData.dateFrom || 'blah'
    const dateTo = userData.dateTo || 'foo'
    const dateRange = [dateFrom, dateTo].join(' - ')

    res.render('pages/summary', {
      selectedList: selectedList.map(x => x.id).toString() ?? 'No services found',
      dateRange,
      caseReference: userData.caseReference || 'dliu35',
    })
  }
}
