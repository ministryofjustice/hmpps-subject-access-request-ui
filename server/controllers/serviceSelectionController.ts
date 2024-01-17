import { Request, Response } from 'express'
import { setUncaughtExceptionCaptureCallback } from 'process'
import ServiceCatalogueClient from '../data/serviceCatalogueClient'
import ServiceSelectionValidation from './serviceSelectionValidation'

export default class ServiceSelectionController {
  static async getServices(req: Request, res: Response) {
    const catalogueclient = new ServiceCatalogueClient()
    // TODO: GetServiceToken
    await catalogueclient.getServiceList().then(list => {
      const newList = []
      for (let i = 0; i < list.length; i += 1) {
        if (list[i].environments[0]) {
          const urlList = []
          for (let j = 0; j < list[i].environments.length; j += 1) {
            urlList.push(list[i].environments[j].url)
          }
          console.log('env', list[i].environments[0].url)
          console.log('Url', urlList)
          newList.push({ text: list[i].name, id: list[i].id, urls: urlList }) // , value: list[i].environments[i].url })
        }
      }
      req.session.serviceList = newList
      const selectedList = req.session.selectedList ?? []
      console.log(selectedList.map(x => x.id))
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
      const selectedServices = list.filter(x => selectedList.includes(x.id.toString()))
      console.log('SERV', selectedServices)
      req.session.selectedList = selectedServices
      res.redirect('/summary')
    }
  }
}
