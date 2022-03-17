declare namespace Koa {
  type Context = import('koa').Context & { user?: User; team?: Team; params?: { [key: string]: string } }
  type Request = import('koa').Request
  type Next = import('koa').Next
  type Middleware = import('koa').Middleware
  type ParameterizedContext<
    StateT = import('koa').DefaultState,
    CustomT = import('koa').DefaultContext
  > = import('koa').ExtendableContext & {
    state: StateT
    user?: User
    team?: Team
    params?: { [key: string]: string }
  } & CustomT
}
