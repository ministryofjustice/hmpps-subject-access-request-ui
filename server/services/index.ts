import { dataAccess } from '../data'
import UserService from './userService'

export const services = () => {
  const { applicationInfo, manageUsersApiClient, hmppsAuthClient } = dataAccess()

  const userService = new UserService(manageUsersApiClient)

  return {
    applicationInfo,
    userService,
    hmppsAuthClient,
  }
}

export type Services = ReturnType<typeof services>

export { UserService }
