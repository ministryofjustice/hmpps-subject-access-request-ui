import { type Request } from 'express'
import getUserToken from './userTokenHelper'

describe('userIdHelper', () => {
  test('returns userToken extracted from request body', () => {
    const req: Request = {
      // @ts-expect-error stubbing session
      session: {},
      user: {
        token: 'mockUserToken',
        authSource: 'auth',
      },
    }
    const userToken = getUserToken(req)
    expect(userToken).toEqual('mockUserToken')
  })
})
