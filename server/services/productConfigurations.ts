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

const createProduct = async (product: NewProduct, req: Request) => {
  await superagent
    .post(`${config.apis.subjectAccessRequest.url}/api/services`)
    .send(product)
    .set('Authorization', `Bearer ${getUserToken(req)}`)
}

export default {
  getProductList,
  getTemplateRegistrationProductList,
  createProduct,
}
