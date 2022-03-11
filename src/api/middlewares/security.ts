import helmet from 'helmet'
import cors from 'cors'

import { koasify } from './wrappers'

export const koaHelmet = async (ctx: Koa.Context, next: Koa.Next) => {
  const handler = helmet()
  await koasify(ctx, handler)
  await next()
}

export const koaCors = async (ctx: Koa.Context, next: Koa.Next) => {
  const handler = cors()
  await koasify(ctx, handler)
  await next()
}
