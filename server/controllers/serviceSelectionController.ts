import { Request, Response } from 'express'
import ServiceCatalogueClient from '../data/serviceCatalogueClient'
import ServiceSelectionValidation from './serviceSelectionValidation'

export default class ServiceSelectionController {
  static async getServices(req: Request, res: Response) {
    const catalogueclient = new ServiceCatalogueClient()
    // TODO: GetServiceToken
    await catalogueclient.getServiceList().then(list => {
      // 'mockToken'

      const newList = []
      for (let i = 0; i < list.length; i += 1) {
        newList.push({ text: list[i].name, value: 'blah', id: list[i].id }) // + list[i].environments[0].get("url", "") + "}")
      }
      req.session.serviceList = newList
      // console.log(new_list)
      const selectedList = req.session.selectedList ?? []
      res.render('pages/serviceselection', {
        servicelist: newList,
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
      res.redirect('/summary')
    }
  }
}
