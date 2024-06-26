import { dataAccess } from '../data'
import UserService from './userService'

export const services = () => {
  const { applicationInfo, manageUsersApiClient, hmppsAuthClient, telemetryClient } = dataAccess()

  const userService = new UserService(manageUsersApiClient)

  return {
    applicationInfo,
    userService,
    hmppsAuthClient,
    telemetryClient,
  }
}

export type Services = ReturnType<typeof services>

export { UserService }
