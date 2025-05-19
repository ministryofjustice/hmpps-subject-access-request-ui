import { type RequestHandler, Router } from 'express'
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function routes(service: Services): Router {
  const router = Router()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string | string[], handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get('/', (req, res, next) => {
    res.render('pages/homepage', { hasAdminRole: res.locals.user.userRoles.includes('SAR_ADMIN_ACCESS') })
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

  get('/admin', (req, res, next) => {
    res.render('pages/admin')
  })
  get('/admin/reports', AdminReportsController.getAdminSummary)
  get('/admin/details', AdminDetailsController.getAdminDetail)
  get('/admin/health', AdminHealthController.getHealth)

  return router
}
