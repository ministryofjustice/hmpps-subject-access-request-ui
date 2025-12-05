import type { Request, Response } from 'express'
import RegisterTemplateConfirmationController from './registerTemplateConfirmationController'
import templateVersionsService from '../services/templateVersions'

const selectedProduct = {
  id: '12345',
  name: 'service-one',
  url: 'http://service-one',
  label: 'Service One',
  order: 1,
}
const templateFileBase64 = 'dGVzdGZpbGUK'
const templateName = 'myfile.mustache'
const newTemplateVersion = {
  id: '159',
  serviceName: 'service-one',
  version: '4',
  createdDate: '2025-11-01',
  fileHash: 'cde321',
  status: 'PENDING',
}

beforeEach(() => {
  jest.resetAllMocks()
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('registerTemplate', () => {
  const req: Request = {
    session: { selectedProduct },
  } as unknown as Request
  const res: Response = {
    render: jest.fn(),
    redirect: jest.fn(),
  } as unknown as Response

  test('redirects to result page after new template version registered successfully', async () => {
    req.session.templateName = templateName
    req.session.templateFileBase64 = templateFileBase64
    templateVersionsService.createTemplateVersion = jest.fn().mockReturnValue(newTemplateVersion)

    await RegisterTemplateConfirmationController.registerTemplate(req, res)

    const expectedTemplateBuffer = Buffer.from(templateFileBase64, 'base64')
    expect(templateVersionsService.createTemplateVersion).toHaveBeenCalledWith(
      selectedProduct,
      templateName,
      expectedTemplateBuffer,
      req,
    )
    expect(res.redirect).toHaveBeenCalledWith('/register-template/result')
    expect(req.session.newVersion).toEqual(newTemplateVersion)
    expect(req.session.templateName).toEqual('')
    expect(req.session.templateFileBase64).toEqual('')
    expect(req.session.versionList).toEqual([])
  })

  test('renders confirmation page with error when error registering template', async () => {
    req.session.templateName = templateName
    req.session.templateFileBase64 = templateFileBase64
    templateVersionsService.createTemplateVersion = jest.fn().mockImplementation(() => {
      throw new Error('test error message')
    })

    await RegisterTemplateConfirmationController.registerTemplate(req, res)

    const expectedTemplateBuffer = Buffer.from(templateFileBase64, 'base64')
    expect(templateVersionsService.createTemplateVersion).toHaveBeenCalledWith(
      selectedProduct,
      templateName,
      expectedTemplateBuffer,
      req,
    )
    expect(res.render).toHaveBeenCalledWith(
      'pages/registerTemplate/confirmation',
      expect.objectContaining({
        selectedProduct,
        templateName,
        registerError: 'test error message',
      }),
    )
  })
})

describe('getResult', () => {
  const req: Request = {
    session: { selectedProduct, newVersion: newTemplateVersion },
  } as unknown as Request
  const res: Response = {
    render: jest.fn(),
    redirect: jest.fn(),
  } as unknown as Response

  test('renders result page', () => {
    RegisterTemplateConfirmationController.getResult(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'pages/registerTemplate/result',
      expect.objectContaining({
        selectedProduct,
        newVersion: newTemplateVersion,
      }),
    )
    expect(req.session.selectedProduct).toEqual({})
    expect(req.session.newVersion).toEqual({})
  })
})
