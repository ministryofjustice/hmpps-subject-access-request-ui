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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function routes(service: Services): Router {
  const router = Router()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string | string[], handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get('/', (req, res, next) => {
    res.render('pages/homepage')
  })

  get('/subject-id', SubjectIdController.getSubjectId)
  post('/subject-id', SubjectIdController.saveSubjectId)

  get('/inputs', InputsController.getInputs)
  post('/inputs', InputsController.saveInputs)

  get('/summary', SummaryController.getReportDetails)
  post('/summary', SummaryController.postReportDetails)

  get('/service-selection', ServiceSelectionController.getServices)

  post('/service-selection', ServiceSelectionController.selectServices)

  get('/confirmation', ConfirmationController.getConfirmation)

  get('/reports', ReportsController.getReports)

  get('/download-report/report', ReportDownloadController.getReport)

  return router
}
