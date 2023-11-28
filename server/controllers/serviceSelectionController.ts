import { Request, Response } from 'express'
import ServiceCatalogueClient from '../data/serviceCatalogueClient'
import ServiceSelectionValidation from './serviceSelectionValidation'

export default class ServiceSelectionController {
  static async getServices(req: Request, res: Response) {
    const catalogueclient = new ServiceCatalogueClient()
    // TODO: GetServiceToken
    await catalogueclient.getServiceList().then(list => {
      // 'mockToken'
      req.session.serviceList = list
      res.render('pages/serviceselection', {
        servicelist: list,
      })
    })
  }

  static selectServices(req: Request, res: Response) {
    const list = req.session.serviceList
    if (list) {
      const selectedServicesError = ServiceSelectionValidation.validateSelection(req.body.selectedServices)
      if (selectedServicesError) {
        res.render('pages/serviceselection', {
          selectedServicesError,
          servicelist: list,
        })
        return
      }
      const selectedServices = list.filter(x => req.body.selectedServices.includes(x.id))
      req.session.selectedList = selectedServices
      res.redirect('/serviceselection')
    }
  }
}