declare namespace App {
  type EndpointOperation = (ctx: import('koa').ParameterizedContext<App.State, App.Context>) => void | Promise<void>

  type EndpointMiddleware = (
    ctx: import('koa').ParameterizedContext<App.State, App.Context>,
    next: import('koa').Next
  ) => Promise<void>

  interface EndpointInfo {
    method: import('enums').HttpMethods
    path: string
    operation: EndpointOperation
    middlewares: EndpointMiddleware[]
    postMiddlewares: EndpointMiddleware[]
  }

  type EndpointsInfo = { [id: string]: EndpointInfo }
}
