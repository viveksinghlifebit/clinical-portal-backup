export type Handler = (req: Http.IncomingMessage, res: Http.ServerResponse, callback: (err?: Error | unknown) => void) => void

export const koasify = (ctx: Koa.Context, handler: Handler) =>
  new Promise((resolve, reject) =>
    handler(
      ctx.req,
      ctx.res,
      (err?: Error | unknown) => err ? reject(err) : resolve(ctx)
    )
  )
