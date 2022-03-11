import path from 'path'
import Koa from 'koa'
import Router from '@koa/router'

import { createOpenApiBackend } from 'services/openapi-backend'
import { NotFoundHttpError } from 'api/http-errors'

import operations from './operations'
import { Request } from 'openapi-backend'

export const loadEndpoints = async (
  app: Koa<App.State, App.Context>,
  endpointsInfo: App.EndpointsInfo,
  prefix = ''
): Promise<Koa<App.State, App.Context>> => {
  const apiEndpoints = _getOperationMapFromEndpointsInfoMap(endpointsInfo)

  const handlers = {
    ...apiEndpoints,
    ...operations
  }

  const openApi = createOpenApiBackend(handlers, _getApiSpecification('./specification.yaml'))

  await openApi.init()

  // // Registering all endpoints
  const router = new Router<App.State, App.Context>({ prefix })
  for (const endpoint of Object.values(endpointsInfo)) {
    router[endpoint.method](
      endpoint.path,
      ...endpoint.middlewares,
      (ctx: Koa.ParameterizedContext<App.State, App.Context>) => openApi.handleRequest(ctx.request as Request, ctx)
    )
  }

  app.use(router.middleware())

  app.use(() => {
    throw new NotFoundHttpError('The API endpoint does not exist.')
  })

  return app
}

const _getOperationMapFromEndpointsInfoMap = (
  EndpointsInfo: App.EndpointsInfo
): { [id: string]: OpenApiBackend.Handler } =>
  Object.keys(EndpointsInfo).reduce(
    (accm: { [id: string]: OpenApiBackend.Handler }, key: keyof App.EndpointsInfo) => ({
      ...accm,
      [key]: _wrapOpenApiContext(EndpointsInfo[key]!.operation)
    }),
    {}
  )

const _wrapOpenApiContext = (operation: App.EndpointOperation): OpenApiBackend.Handler => (
  _: OpenApiBackend.Context,
  ctx: Koa.ParameterizedContext<App.State, App.Context>
) => operation(ctx)

export const _getApiSpecification = (relativePath: string): string => path.resolve(__dirname, relativePath)
