import { Request, type RequestHandler, Response, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import InputsController from '../controllers/inputsController'
import ProductSelectionController from '../controllers/productSelectionController'
import SummaryController from '../controllers/summaryController'
import ConfirmationController from '../controllers/confirmationController'
import SubjectIdController from '../controllers/subjectIdController'
import ReportsController from '../controllers/reportsController'
import ReportDownloadController from '../controllers/reportDownloadController'
import AdminDetailsController from '../controllers/admin/adminDetailsController'
import AdminHealthController from '../controllers/admin/adminHealthController'
import AdminReportsController from '../controllers/admin/adminReportsController'
import RegisterTemplateProductController from '../controllers/registerTemplateProductController'
import RegisterTemplateUploadController from '../controllers/registerTemplateUploadController'
import RegisterTemplateConfirmationController from '../controllers/registerTemplateConfirmationController'
import AdminProductConfigController from '../controllers/admin/adminProductConfigController'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function routes(service: Services): Router {
  const router = Router()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string | string[], ...handlers: RequestHandler[]) =>
    router.post(path, ...handlers.map(handler => asyncMiddleware(handler)))

  get('/', (req, res, next) => {
    res.render('pages/homepage', {
      hasSarUserRole: res.locals.user.userRoles.includes('SAR_USER_ACCESS'),
      hasAdminRole: res.locals.user.userRoles.includes('SAR_ADMIN_ACCESS'),
      hasRegisterTemplateRole: res.locals.user.userRoles.includes('SAR_REGISTER_TEMPLATE'),
    })
  })

  get('/subject-id', SubjectIdController.getSubjectId)
  post('/subject-id', SubjectIdController.saveSubjectId)

  get('/inputs', InputsController.getInputs)
  post('/inputs', InputsController.saveInputs)

  get('/summary', SummaryController.getReportDetails)
  post('/summary', SummaryController.postReportDetail)

  get('/product-selection', ProductSelectionController.getProducts)

  post('/product-selection', ProductSelectionController.selectProducts)

  get('/confirmation', ConfirmationController.getConfirmation)

  get('/reports', ReportsController.getReports)

  get('/download-report/report', ReportDownloadController.getReport)

  get('/terms', (req, res, next) => {
    res.render('pages/terms')
  })

  get('/register-template/select-product', RegisterTemplateProductController.getProducts)
  post('/register-template/select-product', RegisterTemplateProductController.selectProduct)

  get('/register-template/upload', RegisterTemplateUploadController.getProductTemplateVersion)
  post('/register-template/upload', RegisterTemplateUploadController.uploadTemplate)

  get('/register-template/confirmation', (req: Request, res: Response) =>
    res.render('pages/registerTemplate/confirmation', {
      selectedProduct: req.session.selectedProduct,
      templateName: req.session.templateName,
    }),
  )
  post('/register-template/confirmation', RegisterTemplateConfirmationController.registerTemplate)

  get('/register-template/result', RegisterTemplateConfirmationController.getResult)

  get('/admin', (req, res, next) => {
    res.render('pages/admin/admin')
  })
  get('/admin/reports', AdminReportsController.getAdminSummary)
  get('/admin/details', AdminDetailsController.getAdminDetail)
  get('/admin/health', AdminHealthController.getHealth)
  get('/admin/restart', (req, res, next) => {
    const searchParams = new URLSearchParams(Object.entries(req.query).map(([key, value]) => [key, String(value)]))
    res.redirect(`/admin/details?${searchParams.toString()}`)
  })
  post('/admin/restart', AdminDetailsController.restartRequest)
  get('/admin/product-config', AdminProductConfigController.getProductConfigSummary)

  return router
}
