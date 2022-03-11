declare namespace Koa {
  type Context = import('koa').Context
  type Next = import('koa').Next
  type Middleware = import('koa').Middleware
  type ParameterizedContext<StateT = import('koa').DefaultState, CustomT = import('koa').DefaultContext> =
    import('koa').ExtendableContext & {
      state: StateT;
    } & CustomT
}
