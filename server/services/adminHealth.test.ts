import nock from 'nock'
import config from '../config'
import adminHealthService from './adminHealth'
import { HealthResponse } from '../@types/health'

let fakeApi: nock.Scope

const healthResponse: HealthResponse = {
  components: {
    'hmpps-document-management-api': { status: 'UP', details: { healthUrl: 'url', portalUrl: 'url' } },
    'hmpps-external-users-api': { status: 'UP', details: { healthUrl: 'url2', portalUrl: 'url2' } },
    'hmpps-locations-inside-prison-api': { status: 'UP', details: { healthUrl: 'url3', portalUrl: 'url3' } },
    'hmpps-nomis-mapping-service': { status: 'UP', details: { healthUrl: 'url4', portalUrl: 'url4' } },
    'nomis-user-roles-api': { status: 'UP', details: { healthUrl: 'url5', portalUrl: 'url5' } },
    'prison-register': { status: 'UP', details: { healthUrl: 'url6', portalUrl: 'url6' } },
    'subject-access-requests-and-delius': { status: 'UP', details: { healthUrl: 'url7', portalUrl: 'url7' } },
    sarServiceApis: {
      details: {
        G1: { status: 'DOWN' },
        G2: { status: 'UP' },
        'hmpps-book-secure-move-api': { status: 'UP', details: { healthUrl: 'url8', portalUrl: 'url8' } },
        'hmpps-offender-categorisation-api': { status: 'UP', details: { healthUrl: 'url9', portalUrl: 'url9' } },
      },
    },
  },
}

beforeEach(() => {
  fakeApi = nock(config.apis.subjectAccessRequest.url)
})

afterEach(() => {
  nock.cleanAll()
})

describe('adminHealth', () => {
  describe('getHealth', () => {
    test('getHealth returns correct response', async () => {
      fakeApi.get('/health').reply(200, healthResponse)

      const response = await adminHealthService.getHealth()

      expect(response).toEqual(healthResponse)
    })

    test.each([400, 503])('getHealth returns response when error code %s', async errorCode => {
      fakeApi.get('/health').reply(errorCode, healthResponse)

      const response = await adminHealthService.getHealth()

      expect(response).toEqual(healthResponse)
    })

    test.each([400, 503])('getHealth throws error when error code %s but no response', async errorCode => {
      fakeApi.get('/health').reply(errorCode, {})
      await expect(() => adminHealthService.getHealth()).rejects.toThrow(
        `Error getting health details, no health components returned for response status ${errorCode}`,
      )
    })
  })
})
