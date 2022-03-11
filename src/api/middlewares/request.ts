import morgan from 'morgan'
import bodyParser from 'koa-bodyparser'

import { koasify } from './wrappers'

export const koaMorgan = async (ctx: Koa.Context, next: Koa.Next) => {
  const handler = morgan('dev')
  await koasify(ctx, handler)
  await next()
}

export const koaBodyParser = bodyParser()
