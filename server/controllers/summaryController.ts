import { Request, Response } from 'express'

export default class SummaryController {
  static getReportDetails(req: Request, res: Response) {
    const selectedList = req.session.selectedList ?? []
    const userData = req.session.userData ?? {}

    const dateFrom = userData.dateFrom || 'Earliest available'
    const dateTo = userData.dateTo || 'Today'
    const dateRange = [dateFrom, dateTo].join(' - ')

    res.render('pages/summary', {
      selectedList: selectedList.map(x => x.text).toString(),
      dateRange,
      caseReference: userData.caseReference,
    })
  }
}
