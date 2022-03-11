import { error } from './error'
import { koaMorgan, koaBodyParser } from './request'
import { koaHelmet, koaCors } from './security'

export const middelwares: Koa.Middleware[] = [
  error,
  koaMorgan,
  koaHelmet,
  koaCors,
  koaBodyParser
]
