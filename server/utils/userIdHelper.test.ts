import { type Request } from 'express'
import getUserId from './userIdHelper'

describe('userIdHelper', () => {
  describe('getUserId', () => {
    test('returns userId extracted from user token', () => {
      const req: Request = {
        // @ts-expect-error stubbing session
        session: {},
        user: {
          token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX3V1aWQiOiJtb2NrZWRVc2VySWQiLCJuYW1lIjoiRXhhbXBsZSBVc2VyIn0.KcjDfjwlAS8Jlz7swp-X2FlSyRAFtEKvQ6WuzLSzAaU',
          authSource: 'auth',
        },
      }
      const userId = getUserId(req)
      expect(userId).toEqual('mockedUserId')
    })
  })
})
