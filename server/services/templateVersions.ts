import type { Request } from 'express'
import superagent from 'superagent'
import config from '../config'
import logger from '../../logger'
import getUserToken from '../utils/userTokenHelper'
import { formatDateTime } from '../utils/dateHelpers'

const getTemplateVersions = async (selectedProduct: Product, req: Request) => {
  const response = await superagent
    .get(`${config.apis.subjectAccessRequest.url}/api/templates/service/${selectedProduct.id}`)
    .set('Authorization', `Bearer ${getUserToken(req)}`)

  let versionList: ProductVersion[] = response.body
  versionList = versionList
    .sort((a, b) => b.version - a.version)
    .map(v => ({ ...v, createdDate: formatDateTime(v.createdDate) }))
  if (versionList.length > 1 && versionList[0].status === 'PENDING') {
    return versionList.slice(0, 2)
  }
  return versionList.slice(0, 1)
}

const createTemplateVersion = async (
  selectedProduct: Product,
  name: string,
  buffer: Buffer<ArrayBufferLike>,
  req: Request,
): Promise<ProductVersion> => {
  const response = await superagent
    .post(`${config.apis.subjectAccessRequest.url}/api/templates/service/${selectedProduct.id}`)
    .set('Authorization', `Bearer ${getUserToken(req)}`)
    .attach('file', buffer, name)

  return response.body
}

const validateTemplate = async (buffer: Buffer<ArrayBufferLike>, filename: string, req: Request): Promise<string> => {
  try {
    await superagent
      .post(`${config.apis.subjectAccessRequest.url}/api/templates/validate`)
      .set('Authorization', `Bearer ${getUserToken(req)}`)
      .attach('file', buffer, filename)
    return Promise.resolve('OK')
  } catch (err) {
    logger.error('caught template validation error', err)

    // Network/Connection Errors
    if (!err.response) {
      logger.error(`Network error validating template ${filename}`, err)
      throw new Error('Unexpected Error validating template')
    }

    // HTTP errors
    switch (err.status) {
      case 400:
      case 401:
      case 403:
      case 500:
        return Promise.reject(err.response.body?.userMessage || 'Unexpected Error')
      default:
        logger.error(`template validation for ${filename} failed with unexpected error ${err.message}`)
        return Promise.reject(Error('Unexpected Error validating template'))
    }
  }
}

export default {
  getTemplateVersions,
  createTemplateVersion,
  validateTemplate,
}
