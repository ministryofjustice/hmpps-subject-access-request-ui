import { NextFunction } from 'express'
import proxy from 'express-http-proxy'
import config from '../config'
import getReport from './report'

jest.mock('express-http-proxy')
const Proxy = proxy as jest.Mock

const apiUrl = config.apis.subjectAccessRequest.url

describe('getReport', () => {
  it('should download a file', async () => {
    const mockReq = {}
    const mockRes = {}
    const mockNext = () => {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-shadow
    Proxy.mockImplementationOnce((url: string, config: any) => {
      expect(url).toBe(apiUrl)
      expect(config.proxyReqPathResolver()).toBe('/api/report?id=fileId')
      return (myReq: Request, myRes: Response, myNext: NextFunction) => {
        expect(myReq).toBe(mockReq)
        expect(myRes).toBe(mockRes)
        expect(myNext).toBe(mockNext)
      }
    })
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    getReport(mockReq, mockRes, mockNext, 'fileId')
  })
})
