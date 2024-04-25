import { type RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import InputsController from '../controllers/inputsController'
import ServiceSelectionController from '../controllers/serviceSelectionController'
import SummaryController from '../controllers/summaryController'
import ConfirmationController from '../controllers/confirmationController'
import SubjectIdController from '../controllers/subjectIdController'
import ReportsController from '../controllers/reportsController'
const {
  files: raw,
} = require('../services/report')

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function routes(service: Services): Router {
  const router = Router()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string | string[], handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get('/', (req, res, next) => {
    res.render('pages/index')
  })

  get('/subject-id', SubjectIdController.getSubjectId)
  post('/subject-id', SubjectIdController.saveSubjectId)

  get('/inputs', InputsController.getInputs)
  post('/inputs', InputsController.saveInputs)

  get('/summary', SummaryController.getReportDetails)
  post('/summary', SummaryController.postReportDetails)

  get('/service-selection', ServiceSelectionController.getServices)

  router.post('/service-selection', ServiceSelectionController.selectServices)

  get('/confirmation', ConfirmationController.getConfirmation)

  get('/reports', ReportsController.getReports)

  //get('/download-report', ReportsController.downloadReport)

  router.get(
    '/download-report/:fileId',
    (req, res, next) => {
      const {
        params: { fileId }
      } = req
      raw.getRaw(
        req,
        res,
        next,
        fileId,
        // proxyRes => {
        //   if (proxyRes.statusCode >= 400) {
        //     throw new Error(
        //       `${proxyRes.statusCode} - unable to download file.`
        //     )
        //   }
        // },
      )
    }
  )
  return router
}
