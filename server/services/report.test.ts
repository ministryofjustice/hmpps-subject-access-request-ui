import { NextFunction } from 'express'
import config from '../config'

const proxy = require('express-http-proxy')
const getReport = require ('./report')

jest.mock('express-http-proxy')

const apiUrl = config.apis.subjectAccessRequest.url

describe('getReport', () => {
  it('should download a file', async () => {
    const mockReq = {}
    const mockRes = {}
    const mockNext = () => {}
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    proxy.mockImplementationOnce((url: string, config: any) => {
      expect(url).toBe(apiUrl)
      expect(config.proxyReqPathResolver()).toBe('/api/report?id=fileId')
      return (myReq: Request, myRes: Response, myNext: NextFunction) => {
        expect(myReq).toBe(mockReq)
        expect(myRes).toBe(mockRes)
        expect(myNext).toBe(mockNext)
      }
    })

    getReport(mockReq, mockRes, mockNext, 'fileId')
  })
})
