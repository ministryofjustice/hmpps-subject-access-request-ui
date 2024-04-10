import { Request } from 'express'
import { jwtDecode } from 'jwt-decode'

const getUserId = (req: Request) => {
  let requestedBy = null

  const userToken = req.user.token
  const decodedUserToken = jwtDecode(userToken)
  if ('user_uuid' in decodedUserToken) {
    requestedBy = decodedUserToken.user_uuid
  } else if ('user_id' in decodedUserToken) {
    requestedBy = decodedUserToken.user_id
  }
  return requestedBy
}

export default getUserId
