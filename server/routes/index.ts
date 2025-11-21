import { Request, type RequestHandler, Response, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import InputsController from '../controllers/inputsController'
import ServiceSelectionController from '../controllers/serviceSelectionController'
import SummaryController from '../controllers/summaryController'
import ConfirmationController from '../controllers/confirmationController'
import SubjectIdController from '../controllers/subjectIdController'
import ReportsController from '../controllers/reportsController'
import ReportDownloadController from '../controllers/reportDownloadController'
import AdminDetailsController from '../controllers/adminDetailsController'
import AdminHealthController from '../controllers/adminHealthController'
import AdminReportsController from '../controllers/adminReportsController'
import RegisterTemplateServiceController from '../controllers/registerTemplateServiceController'
import RegisterTemplateUploadController from '../controllers/registerTemplateUploadController'
import RegisterTemplateConfirmationController from '../controllers/registerTemplateConfirmationController'

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

  get('/service-selection', ServiceSelectionController.getServices)

  post('/service-selection', ServiceSelectionController.selectServices)

  get('/confirmation', ConfirmationController.getConfirmation)

  get('/reports', ReportsController.getReports)

  get('/download-report/report', ReportDownloadController.getReport)

  get('/terms', (req, res, next) => {
    res.render('pages/terms')
  })

  get('/register-template/select-service', RegisterTemplateServiceController.getServices)
  post('/register-template/select-service', RegisterTemplateServiceController.selectService)

  get('/register-template/upload', RegisterTemplateUploadController.getServiceTemplateVersion)
  post('/register-template/upload', RegisterTemplateUploadController.uploadTemplate)

  get('/register-template/confirmation', (req: Request, res: Response) =>
    res.render('pages/registerTemplate/confirmation', {
      selectedService: req.session.selectedService,
      templateName: req.session.templateName,
    }),
  )
  post('/register-template/confirmation', RegisterTemplateConfirmationController.registerTemplate)

  get('/register-template/result', RegisterTemplateConfirmationController.getResult)

  get('/admin', (req, res, next) => {
    res.render('pages/admin')
  })
  get('/admin/reports', AdminReportsController.getAdminSummary)
  get('/admin/details', AdminDetailsController.getAdminDetail)
  get('/admin/health', AdminHealthController.getHealth)
  get('/admin/restart', (req, res, next) => {
    const searchParams = new URLSearchParams(Object.entries(req.query).map(([key, value]) => [key, String(value)]))
    res.redirect(`/admin/details?${searchParams.toString()}`)
  })
  post('/admin/restart', AdminDetailsController.restartRequest)

  return router
}
