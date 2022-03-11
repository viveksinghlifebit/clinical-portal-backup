import { HttpStatusCodes } from 'enums'
import { log } from 'services/log'
import { ResponseValidationHttpError } from 'api/http-errors'

const validateApiResponse = (
  c: OpenApiBackend.Context,
  ctx: Koa.ParameterizedContext<App.State, App.Context>
): void => {
  if (_shouldValidationBeSkipped(c, ctx)) return

  log.debug(`Response.status: ${ctx.status}`)
  if (ctx.status === HttpStatusCodes.NoContent) return

  const validatedResponse = c.api.validateResponse(ctx.body, c.operation)
  log.debug(`Response.data: ${JSON.stringify(ctx.body)}`)
  log.debug(`ValidResponse: ${JSON.stringify(validatedResponse)}`)
  // Return a 500 if the validation failed
  if (validatedResponse.errors) {
    throw new ResponseValidationHttpError('Response validation failed.', validatedResponse.errors)
  }
}

export const _shouldValidationBeSkipped = (
  _: OpenApiBackend.Context,
  ctx: Koa.ParameterizedContext<App.State, App.Context>
): boolean => ctx.res.headersSent

export default validateApiResponse
