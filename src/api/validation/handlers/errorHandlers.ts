import { HttpStatusCodes } from 'enums'
import { log } from 'services/log'
import { NotFoundHttpError, BadRequestHttpError, AbstractHttpError } from 'errors/http-errors'

export const _generateErrorHandler = (err: AbstractHttpError): OpenApiBackend.Handler => (
  c: OpenApiBackend.Context,
  ctx: Koa.ParameterizedContext<App.State, App.Context>
) => {
  log.error(
    `generateErrorHandler(err: ${err.errorName}, msg: ${err.message}) req ${ctx.request.method} ${ctx.request.path}`
  )
  let { statusMessage, statusCode } = ctx.res

  // Catch the error from validation fail by openapi-backend
  if (c!.validation !== undefined && c!.validation!.valid === false) {
    log.error(
      `OpenAPI validation failed for operation ${c!.operation!.operationId} with error ${JSON.stringify(
        c!.validation!.errors
      )}`
    )
    statusMessage = `validation failed for operation ${c!.operation!.operationId} with error ${JSON.stringify(
      c!.validation!.errors
    )}`
    statusCode = HttpStatusCodes.BadRequest
  }

  // Even if an error occured, res.statusCode can still be 200,
  // for example, when doing a GET request to an endpoints that
  // starts with /api/v1/ but does not exist (ex: /api/v1/non-existent-api)
  if (statusCode === HttpStatusCodes.OK) statusCode = err.status
  if (!statusMessage) statusMessage = err.message

  const errorContainer: App.HttpErrorFormat = {
    statusCode,
    code: err.errorName,
    message: statusMessage,
    time: new Date().toJSON()
  }

  ctx.status = statusCode
  ctx.body = errorContainer
}

const notFound: OpenApiBackend.Handler = _generateErrorHandler(new NotFoundHttpError())

const validationFail: OpenApiBackend.Handler = _generateErrorHandler(new BadRequestHttpError())

const notImplemented: OpenApiBackend.Handler = _generateErrorHandler(new NotFoundHttpError('Not implemented.'))

export const errorHandlers = {
  notFound,
  validationFail,
  notImplemented
}
