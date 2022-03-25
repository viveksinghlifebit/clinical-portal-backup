import { log } from 'services/log'
import { AbstractHttpError, InternalServerErrorHttpError } from 'errors/http-errors'
import { HttpStatusCodes } from 'enums'

export const error = async (ctx: Koa.Context, next: Koa.Next): Promise<void> => {
  try {
    await next()
  } catch (exceptionErr) {
    mapErrorWithContext(ctx, exceptionErr)
  }
}

export const mapErrorWithContext = async (ctx: Koa.Context, exceptionErr: unknown): Promise<void> => {
  const httpError: AbstractHttpError = _extractHttpErrorFromError(exceptionErr as Error)

  const errorResponse: App.HttpErrorFormat = {
    statusCode: (httpError.metadata?.status as HttpStatusCodes) ?? httpError.status,
    code: httpError.metadata?.errorName ?? httpError.errorName,
    message: httpError.message,
    details: httpError.metadata?.details ?? httpError.details,
    time: new Date().toJSON()
  }
  ctx.status = errorResponse.statusCode
  ctx.body = errorResponse
  log.error(error)
}
const _extractHttpErrorFromError = (err: Error): AbstractHttpError => {
  if (err instanceof AbstractHttpError) return err
  else return new InternalServerErrorHttpError()
}
