import { Request, Response } from 'express'
import ServiceCatalogueClient from '../data/serviceCatalogueClient'

export default class ServiceSelectionController {
  static async getServices(req: Request, res: Response) {
    const catalogueclient = new ServiceCatalogueClient()
    // TODO: GetServiceToken
    await catalogueclient.getServiceList().then(list => {
      // 'mockToken'
      req.session.serviceList = list
      // req.session.apiData.serviceList = list
      res.render('pages/serviceselection', {
        servicelist: list,
      })
    })
  }

  static selectServices(req: Request, res: Response) {
    const list = req.session.serviceList
    // req.session.apiData.serviceList = list
    if (list) {
      const selectedServices = list.filter(x => req.body.selectedServices.includes(x.id))
      req.session.selectedList = selectedServices
      // req.session.apiData.selectedList = selectedServices
      res.redirect('/serviceselection')
    }
  }
}
