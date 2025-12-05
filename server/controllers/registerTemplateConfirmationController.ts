import { Request, Response } from 'express'
import { dataAccess } from '../data'
import templateVersionsService from '../services/templateVersions'

export default class RegisterTemplateConfirmationController {
  static async registerTemplate(req: Request, res: Response) {
    const { selectedProduct, templateName, templateFileBase64 } = req.session

    try {
      const newVersion = await templateVersionsService.createTemplateVersion(
        selectedProduct,
        templateName,
        Buffer.from(templateFileBase64, 'base64'),
        req,
      )
      req.session.newVersion = newVersion
      if (dataAccess().telemetryClient) {
        dataAccess().telemetryClient.trackEvent({
          name: 'templateVersionRegistered',
          properties: { product: selectedProduct.name, version: newVersion.version },
        })
      }
    } catch (error) {
      res.render('pages/registerTemplate/confirmation', {
        selectedProduct,
        templateName,
        registerError: error.message,
      })
      return
    }

    res.redirect('/register-template/result')

    req.session.versionList = []
    req.session.templateName = ''
    req.session.templateFileBase64 = ''
  }

  static getResult(req: Request, res: Response) {
    const { selectedProduct, newVersion } = req.session

    res.render('pages/registerTemplate/result', {
      selectedProduct,
      newVersion,
    })

    req.session.selectedProduct = {} as Product
    req.session.newVersion = {} as ProductVersion
  }
}
