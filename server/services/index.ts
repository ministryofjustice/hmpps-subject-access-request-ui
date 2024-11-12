import { dataAccess } from '../data'

export const services = () => {
  const { applicationInfo, hmppsAuthClient, telemetryClient } = dataAccess()

  return {
    applicationInfo,
    hmppsAuthClient,
    telemetryClient,
  }
}

export type Services = ReturnType<typeof services>
