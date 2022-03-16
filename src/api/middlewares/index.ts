import { error } from './error'
import { koaMorgan, koaBodyParser, setStartTimeAndRequestId } from './request'
import { koaHelmet, koaCors } from './security'

export const middlewares: Koa.Middleware[] = [
  setStartTimeAndRequestId,
  error,
  koaMorgan,
  koaHelmet,
  koaCors,
  koaBodyParser
]
