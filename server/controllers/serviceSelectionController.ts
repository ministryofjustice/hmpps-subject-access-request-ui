import { Request, Response } from 'express'
import ServiceCatalogueClient from '../data/serviceCatalogueClient'

export default class ServiceSelectionController {
  static getServices(req: Request, res: Response) {
    const catalogueclient = new ServiceCatalogueClient()
    // TODO: GetServiceToken
    catalogueclient.getServices().then(list => {
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
    const selectedServices = list.filter(x => req.body.selectedServices.includes(x.id))
    req.session.selectedList = selectedServices
    // req.session.apiData.selectedList = selectedServices
    res.redirect('/serviceselection')
  }
}
