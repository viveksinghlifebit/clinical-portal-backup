import { HttpMethods, HttpStatusCodes } from 'enums'
import { CustomHttpError } from 'api/http-errors'

import { _generateErrorHandler } from './errorHandlers'

describe('generateErrorHandler', () => {
  const mockErrorCode = 456
  const mockErrorName = 'Mock Error'
  const mockErrorMessage = 'This is a mock error message.'

  const mockError = new CustomHttpError(mockErrorMessage, mockErrorCode, mockErrorName)

  const mockErrorHandler = _generateErrorHandler(mockError)

  const mockContext: OpenApiBackend.Context = ({
    validation: {
      valid: false,
      errors: []
    },
    operation: {
      operationId: 'mockOperation'
    }
  } as unknown) as OpenApiBackend.Context
  const mockCtx: Koa.ParameterizedContext<App.State, App.Context> = ({
    request: {
      method: HttpMethods.Get,
      path: '/'
    },
    res: {
      statusCode: HttpStatusCodes.OK,
      statusMessage: 'mockStatusMessage'
    }
  } as unknown) as Koa.ParameterizedContext<App.State, App.Context>

  test('If validation failed, check that the error message contains such information and status code is 400.', () => {
    mockContext.validation = {
      valid: false,
      errors: []
    }
    mockErrorHandler(mockContext, mockCtx)
    expect(mockCtx.status).toEqual(HttpStatusCodes.BadRequest)
    expect(mockCtx.body).toEqual(
      expect.objectContaining({
        statusCode: HttpStatusCodes.BadRequest,
        code: mockErrorName,
        message: `validation failed for operation ${mockContext!.operation!.operationId} with error ${JSON.stringify(
          mockContext!.validation!.errors
        )}`
      })
    )
  })

  test('If validation passed, check that the resulting error container is correct.', () => {
    mockContext.validation = {
      valid: true,
      errors: null
    }
    mockErrorHandler(mockContext, mockCtx)
    expect(mockCtx.status).toEqual(mockErrorCode)
    expect(mockCtx.body).toEqual(
      expect.objectContaining({
        statusCode: mockErrorCode,
        code: mockErrorName,
        message: mockCtx.res.statusMessage,
        time: expect.any(String)
      })
    )
  })
})
