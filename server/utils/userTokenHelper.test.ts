import { type Request } from 'express'
import getUserToken from './userTokenHelper'

describe('userIdHelper', () => {
  test('returns userToken extracted from request body', () => {
    const req: Request = {
      session: {},
      user: {
        token: 'mockUserToken',
        authSource: 'auth',
      },
    } as unknown as Request
    const userToken = getUserToken(req)
    expect(userToken).toEqual('mockUserToken')
  })
})
