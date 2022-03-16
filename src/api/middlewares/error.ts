import { log } from 'services/log'
import { AbstractHttpError, InternalServerErrorHttpError } from 'api/http-errors'

export const error = async (ctx: Koa.Context, next: Koa.Next): Promise<void> => {
  try {
    await next()
  } catch (exceptionErr) {
    const httpError: AbstractHttpError = _extractHttpErrorFromError(exceptionErr as Error)

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
  else return new InternalServerErrorHttpError()
}
