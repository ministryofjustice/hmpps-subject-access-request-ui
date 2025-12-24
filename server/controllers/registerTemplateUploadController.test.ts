import type { Request, Response } from 'express'
import RegisterTemplateUploadController from './registerTemplateUploadController'
import templateVersionsService from '../services/templateVersions'

const productVersions = [
  {
    id: '123',
    serviceName: 'service-one',
    version: '2',
    createdDate: '2025-11-01',
    fileHash: 'abc123',
    status: 'PENDING',
  },
  {
    id: '456',
    serviceName: 'service-one',
    version: '1',
    createdDate: '2025-11-01',
    fileHash: 'def456',
    status: 'PUBLISHED',
  },
]
const selectedProduct = {
  id: '12345',
  name: 'service-one',
  url: 'http://service-one',
  label: 'Service One',
  order: 1,
  category: 'PRISON',
}

beforeEach(() => {
  jest.resetAllMocks()
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('getProductTemplateVersion', () => {
  const req: Request = {
    session: {},
  } as unknown as Request
  const res: Response = {
    render: jest.fn(),
  } as unknown as Response

  test('renders upload page after retrieving selected product version', async () => {
    req.session.selectedProduct = selectedProduct
    templateVersionsService.getTemplateVersions = jest.fn().mockReturnValue(productVersions)

    await RegisterTemplateUploadController.getProductTemplateVersion(req, res)

    expect(templateVersionsService.getTemplateVersions).toHaveBeenCalledWith(selectedProduct, req)
    expect(res.render).toHaveBeenCalledWith(
      'pages/registerTemplate/upload',
      expect.objectContaining({
        versionList: productVersions,
        selectedProduct,
      }),
    )
    expect(req.session.versionList).toEqual(productVersions)
  })

  test('renders upload page with error when no selected product in session', async () => {
    req.session.selectedProduct = null
    await RegisterTemplateUploadController.getProductTemplateVersion(req, res)

    expect(templateVersionsService.getTemplateVersions).not.toHaveBeenCalledWith(expect.anything)
    expect(res.render).toHaveBeenCalledWith(
      'pages/registerTemplate/upload',
      expect.objectContaining({
        uploadError: 'No product selected',
      }),
    )
    expect(req.session.versionList).toEqual(productVersions)
  })
})

describe('uploadTemplate', () => {
  let req: Request
  const res: Response = {
    render: jest.fn(),
    redirect: jest.fn(),
  } as unknown as Response
  const templateBase64 = 'dGVzdGZpbGUK'

  beforeEach(() => {
    req = {
      session: { selectedProduct, versionList: productVersions },
      file: {},
      body: {},
    } as unknown as Request
  })

  test('redirects to confirmation page when file uploaded successfully', async () => {
    req.file.buffer = Buffer.from(templateBase64, 'base64')
    req.file.originalname = 'myfile.mustache'

    await RegisterTemplateUploadController.uploadTemplate(req, res)

    expect(res.redirect).toHaveBeenCalledWith('/register-template/confirmation')
    expect(req.session.templateName).toEqual('myfile.mustache')
    expect(req.session.templateFileBase64).toEqual(templateBase64)
  })

  test('renders upload page with error when no file uploaded', async () => {
    req.file = null

    await RegisterTemplateUploadController.uploadTemplate(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'pages/registerTemplate/upload',
      expect.objectContaining({
        uploadError: 'Please select template file to upload',
        versionList: productVersions,
        selectedProduct,
      }),
    )
  })

  test('renders upload page with error when file uploaded is not mustache file', async () => {
    req.file.buffer = Buffer.from(templateBase64, 'base64')
    req.file.originalname = 'myfile.pdf'

    await RegisterTemplateUploadController.uploadTemplate(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'pages/registerTemplate/upload',
      expect.objectContaining({
        uploadError: 'Please ensure a mustache file is selected',
        versionList: productVersions,
        selectedProduct,
      }),
    )
  })

  test('renders upload page with error when no selected product in session', async () => {
    req.session.selectedProduct = null

    await RegisterTemplateUploadController.uploadTemplate(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'pages/registerTemplate/upload',
      expect.objectContaining({
        uploadError: 'No product selected',
      }),
    )
  })
})
