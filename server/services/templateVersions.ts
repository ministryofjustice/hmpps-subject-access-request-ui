import type { Request } from 'express'
import superagent from 'superagent'
import config from '../config'
import getUserToken from '../utils/userTokenHelper'
import { formatDateTime } from '../utils/dateHelpers'

const getTemplateVersions = async (selectedService: Service, req: Request) => {
  const response = await superagent
    .get(`${config.apis.subjectAccessRequest.url}/api/templates/service/${selectedService.id}`)
    .set('Authorization', `Bearer ${getUserToken(req)}`)

  let versionList: ServiceVersion[] = response.body
  versionList = versionList
    .sort((a, b) => b.version - a.version)
    .map(v => ({ ...v, createdDate: formatDateTime(v.createdDate) }))
  if (versionList.length > 1 && versionList[0].status === 'PENDING') {
    return versionList.slice(0, 2)
  }
  return versionList.slice(0, 1)
}

const createTemplateVersion = async (
  selectedService: Service,
  name: string,
  buffer: Buffer<ArrayBufferLike>,
  req: Request,
): Promise<ServiceVersion> => {
  const response = await superagent
    .post(`${config.apis.subjectAccessRequest.url}/api/templates/service/${selectedService.id}`)
    .set('Authorization', `Bearer ${getUserToken(req)}`)
    .attach('file', buffer, name)

  return response.body
}

export default {
  getTemplateVersions,
  createTemplateVersion,
}
