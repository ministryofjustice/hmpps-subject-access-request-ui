import type { Request, Response } from 'express'
import { audit, AuditEvent } from '../audit'
import adminHealthService from '../services/adminHealth'
import { ServiceHealthComponent } from '../@types/health'

export default class AdminHealthController {
  static async getHealth(req: Request, res: Response) {
    const sendAudit = audit(res.locals.user.username)
    await sendAudit(AuditEvent.VIEW_ADMIN_HEALTH_ATTEMPT)

    const health = await adminHealthService.getHealth()

    const documentStoreHealthRows = [
      AdminHealthController.getHealthRow('Document store', health.components['hmpps-document-management-api']),
    ]
    const lookupServiceHealthRows = [
      AdminHealthController.getHealthRow('Prison', health.components['prison-register']),
      AdminHealthController.getHealthRow('External User', health.components['hmpps-external-users-api']),
      AdminHealthController.getHealthRow('Nomis User', health.components['nomis-user-roles-api']),
      AdminHealthController.getHealthRow('Probation User', health.components['subject-access-requests-and-delius']),
      AdminHealthController.getHealthRow('Locations', health.components['hmpps-locations-inside-prison-api']),
      AdminHealthController.getHealthRow('Locations Nomis Mappings', health.components['hmpps-nomis-mapping-service']),
    ]
    const sarServiceComponents = health.components.sarServiceApis.details
    const sarServiceHealthRows = Object.keys(health.components.sarServiceApis.details).map(item =>
      AdminHealthController.getHealthRow(item, sarServiceComponents[item]),
    )

    res.render('pages/adminHealth', {
      documentStoreHealthRows,
      lookupServiceHealthRows,
      sarServiceHealthRows,
    })
  }

  static getHealthRow(name: string, component: ServiceHealthComponent): Array<object> {
    return [
      { text: name },
      { html: component.details && `<a href="${component.details.healthUrl}">Health</a>` },
      { text: component.status, classes: `health-table__cell_${component.status}` },
      { text: component.details && component.details.error },
      { html: component.details && `<a href="${component.details.portalUrl}">Dev Portal</a>` },
    ]
  }
}
