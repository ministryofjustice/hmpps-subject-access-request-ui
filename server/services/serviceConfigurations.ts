import type { Request } from 'express'
import superagent from 'superagent'
import config from '../config'
import getUserToken from '../utils/userTokenHelper'

const getServiceList = async (req: Request) => {
  const response = await superagent
    .get(`${config.apis.subjectAccessRequest.url}/api/services`)
    .set('Authorization', `Bearer ${getUserToken(req)}`)

  const servicesList: Service[] = response.body
  return servicesList.sort((a, b) => a.order - b.order)
}

const getTemplateRegistrationServiceList = async (req: Request) =>
  getServiceList(req).then(serviceList =>
    serviceList.filter(service => !config.templateRegistrationExcludedServices.includes(service.name)),
  )

export default {
  getServiceList,
  getTemplateRegistrationServiceList,
}
