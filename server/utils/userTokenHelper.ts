import { Request } from 'express'

const getUserToken = (req: Request) => {
  return req.user.token
}

export default getUserToken
