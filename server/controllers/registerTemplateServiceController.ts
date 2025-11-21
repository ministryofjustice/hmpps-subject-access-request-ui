import { Request, Response } from 'express'
import ServiceSelectionValidation from './serviceSelectionValidation'
import serviceConfigsService from '../services/serviceConfigurations'

export default class RegisterTemplateServiceController {
  static async getServices(req: Request, res: Response) {
    const serviceList = await serviceConfigsService.getTemplateRegistrationServiceList(req)

    if (serviceList.length === 0) {
      res.render('pages/registerTemplate/selectService', {
        selectedServiceError: 'No services found. A template cannot be registered.',
        serviceList,
      })
      return
    }

    req.session.serviceList = serviceList

    res.render('pages/registerTemplate/selectService', {
      serviceList,
    })
  }

  static selectService(req: Request, res: Response) {
    const { serviceList } = req.session
    const selectedService = req.body.service
    const selectedServiceError = ServiceSelectionValidation.validateSingleSelection(selectedService, serviceList)
    if (selectedServiceError) {
      res.render('pages/registerTemplate/selectService', {
        selectedServiceError,
        serviceList,
      })
      return
    }
    req.session.selectedService = serviceList.find(service => selectedService === service.id)
    res.redirect('/register-template/upload')
  }
}
