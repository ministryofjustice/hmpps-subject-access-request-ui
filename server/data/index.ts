import { telemetry } from '@ministryofjustice/hmpps-azure-telemetry'
import applicationInfoSupplier from '../applicationInfo'
import HmppsAuthClient from './hmppsAuthClient'
import { createRedisClient } from './redisClient'
import TokenStore from './tokenStore'

const applicationInfo = applicationInfoSupplier()

type RestClientBuilder<T> = (token: string) => T

export const dataAccess = () => ({
  applicationInfo,
  hmppsAuthClient: new HmppsAuthClient(new TokenStore(createRedisClient())),
  telemetryClient: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING ? telemetry : null,
})

export type DataAccess = ReturnType<typeof dataAccess>

export { HmppsAuthClient, RestClientBuilder }
