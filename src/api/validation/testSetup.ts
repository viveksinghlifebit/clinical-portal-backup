import { HttpStatusCodes, HttpMethods } from 'enums'
import { BadRequestHttpError } from 'errors/http-errors'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getMockApiSpecification = (): any => ({
  openapi: '3.0.3',
  info: {
    title: 'Test API',
    version: '1.0.0'
  },
  paths: {
    '/ping': {
      get: {
        operationId: 'ping',
        responses: {
          200: { description: 'pong' }
        }
      }
    },
    '/ok': {
      get: {
        operationId: 'testOk',
        responses: {
          200: { description: 'ok' }
        }
      }
    },
    '/error': {
      get: {
        operationId: 'testError',
        responses: {
          500: { description: 'InternalServerError' }
        }
      }
    }
  }
})

export const getMockDocumentedEndpointsInfo = (): App.EndpointsInfo => ({
  testOk: {
    method: HttpMethods.Get,
    path: 'ok',
    operation: async (ctx) => {
      ctx.status = HttpStatusCodes.OK
      ctx.body = 'OK!'
    },
    middlewares: [],
    postMiddlewares: []
  },
  testError: {
    method: HttpMethods.Get,
    path: 'error',
    operation: async () => {
      throw new BadRequestHttpError('Error!')
    },
    middlewares: [],
    postMiddlewares: []
  }
})

export const getMockNonDocumentedEndpointsInfo = (): App.EndpointsInfo => ({
  testNonDocumented: {
    method: HttpMethods.Get,
    path: 'non documented',
    operation: async (ctx) => {
      ctx.status = HttpStatusCodes.OK
      ctx.body = 'non documented!'
    },
    middlewares: [],
    postMiddlewares: []
  }
})
