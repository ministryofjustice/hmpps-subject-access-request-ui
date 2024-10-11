import { Request, Response } from 'express'
import ServiceCatalogueClient from '../data/serviceCatalogueClient'
import ServiceSelectionValidation from './serviceSelectionValidation'
import { dataAccess } from '../data'
import { ServiceCatalogueItem } from '../data/serviceCatalogueData'

export default class ServiceSelectionController {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  static getServiceCatalogueList(): ServiceCatalogueItem[] {
    const catalogueClient = new ServiceCatalogueClient()
    return  catalogueClient.getServiceList()
  }

  static async getServices(req: Request, res: Response) {
    const serviceCatalogueItems = ServiceSelectionController.getServiceCatalogueList()
    if (serviceCatalogueItems.length === 0) {
      res.render('pages/serviceSelection', {
        selectedServicesError: `No services found. A report cannot be generated.`,
        serviceList: serviceCatalogueItems,
        buttonText: 'Confirm',
      })
      return
    }

    const serviceCatalogue = serviceCatalogueItems.map(x => ({ name: x.label, id: x.name, url: x.url, disabled: x.disabled }))
    req.session.serviceList = serviceCatalogue
    const selectedList = req.session.selectedList ?? []
    const hasAllAnswers = req.session.selectedList && req.session.selectedList.length !== 0
    if (hasAllAnswers) {
      res.render('pages/serviceSelection', {
        serviceList: serviceCatalogue,
        selectedList: selectedList.map(x => x.id),
        buttonText: 'Confirm and return to summary page',
      })
      return
    }

    res.render('pages/serviceSelection', {
      serviceList: serviceCatalogue,
      selectedList: selectedList.map(x => x.id),
      buttonText: 'Confirm',
    })
  }

  static selectServices(req: Request, res: Response) {
    const serviceList = req.session.serviceList
    const selectedList: string[] = []
    if (dataAccess().telemetryClient) {
      dataAccess().telemetryClient.trackEvent({
        name: 'selectServices',
        properties: { id: req.session.selectedList },
      })
    }
    if (serviceList) {
      if (Array.isArray(req.body.selectedServices)) selectedList.push(...req.body.selectedServices)
      else if (req.body.selectedServices) selectedList.push(req.body.selectedServices)

      const selectedServicesError = ServiceSelectionValidation.validateSelection(selectedList, serviceList)
      if (selectedServicesError) {
        res.render('pages/serviceSelection', {
          selectedServicesError,
          serviceList,
          buttonText: 'Confirm',
        })
        return
      }
      req.session.selectedList = serviceList.filter(x => selectedList.includes(x.id.toString()))
      res.redirect('/summary')
    }
  }
}
