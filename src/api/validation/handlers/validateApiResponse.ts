import { HttpStatusCodes } from 'enums'
import { log } from 'services/log'

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

  ctx.state = {
    ...ctx.state,
    responseStatusCode: ctx.status,
    responseBody: ctx.body
  }
  if (validatedResponse.errors) {
    log.error('Response validation failed.', validatedResponse.errors)
  }
}

export const _shouldValidationBeSkipped = (
  _: OpenApiBackend.Context,
  ctx: Koa.ParameterizedContext<App.State, App.Context>
): boolean => ctx.res.headersSent

export default validateApiResponse
