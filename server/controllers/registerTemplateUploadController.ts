import { Request, Response } from 'express'
import templateVersionsService from '../services/templateVersions'

export default class RegisterTemplateUploadController {
  static async getProductTemplateVersion(req: Request, res: Response) {
    const { selectedProduct } = req.session

    if (!selectedProduct) {
      res.render('pages/registerTemplate/upload', {
        selectedProduct,
        uploadError: 'No product selected',
      })
      return
    }

    const versionList = await templateVersionsService.getTemplateVersions(selectedProduct, req)
    req.session.versionList = versionList

    res.render('pages/registerTemplate/upload', {
      versionList,
      selectedProduct,
    })
  }

  static async uploadTemplate(req: Request, res: Response) {
    const { selectedProduct, versionList } = req.session

    if (!selectedProduct) {
      res.render('pages/registerTemplate/upload', {
        selectedProduct,
        uploadError: 'No product selected',
      })
      return
    }

    if (!req.file) {
      res.render('pages/registerTemplate/upload', {
        versionList,
        selectedProduct,
        uploadError: 'Please select template file to upload',
      })
      return
    }

    const { buffer, originalname } = req.file

    if (!originalname.toLowerCase().endsWith('.mustache')) {
      res.render('pages/registerTemplate/upload', {
        versionList,
        selectedProduct,
        uploadError: 'Please ensure a mustache file is selected',
      })
      return
    }

    const validationErr = templateVersionsService.validateTemplateBody(
      RegisterTemplateUploadController.getTemplateBody(buffer),
    )
    if (validationErr != null) {
      res.render('pages/registerTemplate/upload', {
        versionList,
        selectedProduct,
        uploadError: `Invalid mustache template: ${validationErr.message.trim()}`,
      })
      return
    }

    req.session.templateName = originalname
    req.session.templateFileBase64 = buffer.toString('base64')
    res.redirect('/register-template/confirmation')
  }

  private static getTemplateBody(buffer: Buffer): string {
    return Buffer.from(buffer.toString('utf-8')).toString()
  }
}
