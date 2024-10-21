import fs from 'fs'
import yaml from 'js-yaml'
import { ServiceDataItem, getServicesDataByEnvironment } from './serviceData'

jest.mock('fs')
jest.mock('js-yaml')

describe('getServiceDataByEnvironment', () => {
  const mockData = {
    environments: [
      {
        environment: 'test',
        services: [
          {
            name: 'service1',
            url: 'http://service1.com',
            label: 'Service 1',
            order: 1,
            disabled: false,
          },
        ],
      },
    ],
  }

  beforeEach(() => {
    ;(fs.readFileSync as jest.Mock).mockReturnValue('file content')
    ;(yaml.load as jest.Mock).mockReturnValue(mockData)
  })

  it('should return services for the given environment', () => {
    const result = getServicesDataByEnvironment('test')
    const expected: ServiceDataItem[] = [
      {
        name: 'service1',
        url: 'http://service1.com',
        label: 'Service 1',
        order: 1,
        disabled: false,
      },
    ]
    expect(result).toEqual(expected)
  })

  it('should return an empty array if the environment does not exist', () => {
    const result = getServicesDataByEnvironment('nonexistent')
    expect(result).toEqual([])
  })

  it('should throw an error if the file cannot be read', () => {
    ;(fs.readFileSync as jest.Mock).mockImplementation(() => {
      throw new Error('File not found')
    })
    expect(() => getServicesDataByEnvironment('test')).toThrow('File not found')
  })
})
