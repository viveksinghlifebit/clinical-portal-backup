declare namespace App {
  type EndpointOperation = (
    ctx: import('koa').ParameterizedContext<App.State, App.Context>,
    authCtx: AuthenticatedCloudOs
  ) => void | Promise<void>

  type EndpointMiddleware = (
    ctx: import('koa').ParameterizedContext<App.State, App.Context>,
    next: import('koa').Next
  ) => Promise<void>

  interface AuthenticatedCloudOs {
    user: User
    team: Team
  }
  interface EndpointInfo {
    method: import('enums').HttpMethods
    path: string
    operation: EndpointOperation
    middlewares: any
    postMiddlewares: EndpointMiddleware[]
  }

  type EndpointsInfo = { [id: string]: EndpointInfo }

  interface PaginationRequest {
    pageSize?: number
    pageNumber?: number
    sort?: string
    search?: string
    searchField?: string
  }

  interface PaginationResponse<T = unknown> {
    pageSize: number
    pageNumber: number
    totalCount: number
    totalPages: number
    data: T[]
  }
}
