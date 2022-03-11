import { log } from 'services/log'
import { AbstractHttpError, InternalServerErrorHttpError } from 'api/http-errors'

export const error = async (ctx: Koa.Context, next: Koa.Next) => {
  try {
    await next()
  } catch (error) {
    const httpError: AbstractHttpError = _extractHttpErrorFromError(error)

    const errorResponse: App.HttpErrorFormat = {
      statusCode: httpError.status,
      code: httpError.errorName,
      message: httpError.message,
      details: httpError.details,
      time: new Date().toJSON()
    }

    ctx.status = errorResponse.statusCode
    ctx.body = errorResponse

    log.error(error)
  }
}

const _extractHttpErrorFromError = (err: Error): AbstractHttpError => {
  if (err instanceof AbstractHttpError) return err
  // To implement new non Http Error classes
  else if (err instanceof (() => 'NonHttpError')) return _mapErrorToHttpError(error)
  else return new InternalServerErrorHttpError()
}

const _mapErrorToHttpError = (_: any): AbstractHttpError => {
  return new InternalServerErrorHttpError()
}
