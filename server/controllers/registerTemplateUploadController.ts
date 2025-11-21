import { Request, Response } from 'express'
import templateVersionsService from '../services/templateVersions'

export default class RegisterTemplateUploadController {
  static async getServiceTemplateVersion(req: Request, res: Response) {
    const { selectedService } = req.session

    const versionList = await templateVersionsService.getTemplateVersions(selectedService, req)
    req.session.versionList = versionList

    res.render('pages/registerTemplate/upload', {
      versionList,
      selectedService,
    })
  }

  static async uploadTemplate(req: Request, res: Response) {
    const { selectedService, versionList } = req.session

    if (!req.file) {
      res.render('pages/registerTemplate/upload', {
        versionList,
        selectedService,
        uploadError: 'Please select template file to upload',
      })
      return
    }

    const { buffer, originalname } = req.file
    req.session.templateName = originalname
    req.session.templateFileBase64 = buffer.toString('base64')

    if (!req.session.templateName.toLowerCase().endsWith('.mustache')) {
      res.render('pages/registerTemplate/upload', {
        versionList,
        selectedService,
        uploadError: 'Please ensure a mustache file is selected',
      })
      return
    }

    res.redirect('/register-template/confirmation')
  }
}
