import superagent from 'superagent'
import config from '../config'
import { HealthResponse } from '../@types/health'

const getHealth = async (): Promise<HealthResponse> => {
  const response = await superagent.get(`${config.apis.subjectAccessRequest.url}/health`)
  return response.body
}

export default {
  getHealth,
}
