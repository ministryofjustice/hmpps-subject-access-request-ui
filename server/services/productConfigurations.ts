import type { Request } from 'express'
import superagent from 'superagent'
import config from '../config'
import getUserToken from '../utils/userTokenHelper'

const getProductList = async (req: Request): Promise<Product[]> => {
  const response = await superagent
    .get(`${config.apis.subjectAccessRequest.url}/api/services`)
    .set('Authorization', `Bearer ${getUserToken(req)}`)

  return response.body
}

const getTemplateRegistrationProductList = async (req: Request) =>
  getProductList(req).then(productList =>
    productList.filter(product => !config.templateRegistrationExcludedProducts.includes(product.name)),
  )

const createProduct = async (product: Product, req: Request) => {
  await superagent
    .post(`${config.apis.subjectAccessRequest.url}/api/services`)
    .send(product)
    .set('Authorization', `Bearer ${getUserToken(req)}`)
}

const updateProduct = async (product: Product, req: Request) => {
  await superagent
    .put(`${config.apis.subjectAccessRequest.url}/api/services/${product.id}`)
    .send({
      name: product.name,
      url: product.url,
      label: product.label,
      category: product.category,
      enabled: product.enabled,
      templateMigrated: product.templateMigrated,
    })
    .set('Authorization', `Bearer ${getUserToken(req)}`)
}

export default {
  getProductList,
  getTemplateRegistrationProductList,
  createProduct,
  updateProduct,
}
