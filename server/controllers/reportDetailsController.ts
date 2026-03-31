import type { Request, Response } from 'express'

import reportService from '../services/report'
import productConfigsService from '../services/productConfigurations'

export default class ReportDetailsController {
  static async getReportDetails(req: Request, res: Response) {
    const sarId = req.query.id as string

    const subjectAccessRequest = await reportService.getSubjectAccessRequestFormatted(req, sarId)
    const searchParamsString = ReportDetailsController.getSearchParamsString(req.session.searchOptions)
    const productList = await productConfigsService.getProductList(req)

    res.render('pages/reportDetails', {
      subjectAccessRequest,
      searchParamsString,
      suspendedProductsList: productList.filter((p: Product) => p.suspended),
    })
  }

  private static getSearchParamsString(searchOptions: SearchOptions) {
    const searchParams = new URLSearchParams({})
    if (searchOptions) {
      if (searchOptions.searchTerm) searchParams.append('keyword', searchOptions.searchTerm)
    }
    return searchParams.toString()
  }
}
