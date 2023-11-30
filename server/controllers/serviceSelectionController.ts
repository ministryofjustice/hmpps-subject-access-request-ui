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
      const selectedList = req.session.selectedList ?? []
      res.render('pages/serviceselection', {
        servicelist: list,
        selectedList: selectedList.map(x => x.id),
      })
    })
  }

  static selectServices(req: Request, res: Response) {
    const list = req.session.serviceList
    const selectedList: string[] = []
    if (list) {
      if (Array.isArray(req.body.selectedServices)) selectedList.push(...req.body.selectedServices)
      else if (req.body.selectedServices) selectedList.push(req.body.selectedServices)

      const selectedServicesError = ServiceSelectionValidation.validateSelection(selectedList, list)
      if (selectedServicesError) {
        res.render('pages/serviceselection', {
          selectedServicesError,
          servicelist: list,
        })
        return
      }
      const selectedServices = list.filter(x => selectedList.includes(x.id))
      req.session.selectedList = selectedServices
      res.redirect('/serviceselection')
    }
  }
}
