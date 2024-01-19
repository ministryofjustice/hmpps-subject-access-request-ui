import { Request, Response } from 'express'
import ServiceCatalogueClient from '../data/serviceCatalogueClient'
import ServiceSelectionValidation from './serviceSelectionValidation'

export default class ServiceSelectionController {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  static async getServiceCatalogueList(): Promise<any> {
    const catalogueclient = new ServiceCatalogueClient()
    // TODO: GetServiceToken
    const list = await catalogueclient.getServiceList()
    return list
  }

  static async getServices(req: Request, res: Response) {
    const list = await ServiceSelectionController.getServiceCatalogueList()
    if (list.length === 0) {
      res.render('pages/serviceselection', {
        selectedServicesError: `No services found. A report cannot be generated`,
        servicelist: list,
      })
      return
    }

    const newList = []
    for (let i = 0; i < list.length; i += 1) {
      if (list[i].environments[0]) {
        const urlList = []
        for (let j = 0; j < list[i].environments.length; j += 1) {
          urlList.push(list[i].environments[j].url)
        }
        newList.push({ text: list[i].name, id: list[i].id, urls: urlList })
      }
    }
    req.session.serviceList = newList
    const selectedList = req.session.selectedList ?? []

    res.render('pages/serviceselection', {
      servicelist: newList,
      selectedList: selectedList.map(x => x.id),
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
      const selectedServices = list.filter(x => selectedList.includes(x.id.toString()))
      req.session.selectedList = selectedServices
      res.redirect('/summary')
    }
  }
}
