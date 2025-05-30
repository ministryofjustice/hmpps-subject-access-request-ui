import { UserData } from '../userdata'
import { HmppsUser } from '../../interfaces/hmppsUser'
import type { SubjectAccessRequest } from '../subjectAccessRequest'
import type { SearchOptions } from '../searchOptions'

export default {}

export declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    nowInMinutes: number
    userData: UserData
    serviceList: Service[]
    selectedList: Service[]
    subjectAccessRequests: SubjectAccessRequest[]
    searchOptions: SearchOptions
    currentPage: string
  }
}

export declare global {
  namespace Express {
    interface User {
      username: string
      token: string
      authSource: string
    }

    interface Request {
      verified?: boolean
      id: string
      logout(done: (err: unknown) => void): void
    }

    interface Locals {
      user: HmppsUser
    }
  }
}
