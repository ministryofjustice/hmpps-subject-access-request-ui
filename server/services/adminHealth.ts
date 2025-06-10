import superagent from 'superagent'
import config from '../config'
import { HealthResponse } from '../@types/health'

const getHealth = async (): Promise<HealthResponse> => {
  const response = await superagent.get(`${config.apis.subjectAccessRequest.url}/health`).ok(res => true)
  if (response.body && response.body.components) {
    return response.body
  }
  throw new Error(`Error getting health details, no health components returned for response status ${response.status}`)
}

export default {
  getHealth,
}
