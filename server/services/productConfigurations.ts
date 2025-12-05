import type { Request } from 'express'
import superagent from 'superagent'
import config from '../config'
import getUserToken from '../utils/userTokenHelper'

const getProductList = async (req: Request) => {
  const response = await superagent
    .get(`${config.apis.subjectAccessRequest.url}/api/services`)
    .set('Authorization', `Bearer ${getUserToken(req)}`)

  const productList: Product[] = response.body
  return productList.sort((a, b) => a.order - b.order)
}

const getTemplateRegistrationProductList = async (req: Request) =>
  getProductList(req).then(productList =>
    productList.filter(product => !config.templateRegistrationExcludedProducts.includes(product.name)),
  )

export default {
  getProductList,
  getTemplateRegistrationProductList,
}
