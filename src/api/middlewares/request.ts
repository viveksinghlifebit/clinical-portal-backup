import morgan from 'morgan'
import bodyParser from 'koa-bodyparser'
import { v4 } from 'uuid'
import { koasify } from './wrappers'

export const koaMorgan = async (ctx: Koa.Context, next: Koa.Next): Promise<void> => {
  const handler = morgan('dev')
  await koasify(ctx, handler)
  await next()
}

export const koaBodyParser = bodyParser()

export const setStartTimeAndRequestId = async (ctx: Koa.Context, next: Koa.Next): Promise<void> => {
  ctx.state = {
    requestId: ctx.request.headers?.['x-request-id'] ?? v4(),
    startTime: process.hrtime()
  }
  await next()
}
