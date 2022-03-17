import { HttpStatusCodes } from 'enums'
import { BadRequestHttpError } from 'errors/http-errors'

import { error } from './error'

describe('error', () => {
  let ctx: Koa.Context
  let next: jest.Mock

  beforeEach(() => {
    ctx = ({} as unknown) as Koa.Context
  })

  afterEach(jest.restoreAllMocks)

  test('When called with a non http error, then expect to map it to an InternalServerErrorHttpError.', async () => {
    next = jest.fn().mockRejectedValue(new Error())
    await error(ctx, next)
    expect(ctx.status).toEqual(HttpStatusCodes.InternalServerError)
    expect(ctx.body).toEqual({
      statusCode: HttpStatusCodes.InternalServerError,
      code: HttpStatusCodes[HttpStatusCodes.InternalServerError],
      message: 'Internal server error.',
      details: undefined,
      time: expect.any(String)
    })
  })

  test('When called with a http error, then expect to use the specified error.', async () => {
    next = jest.fn().mockRejectedValue(new BadRequestHttpError())
    await error(ctx, next)
    expect(ctx.status).toEqual(HttpStatusCodes.BadRequest)
    expect(ctx.body).toEqual({
      statusCode: HttpStatusCodes.BadRequest,
      code: HttpStatusCodes[HttpStatusCodes.BadRequest],
      message: 'Bad Request.',
      details: undefined,
      time: expect.any(String)
    })
  })
})
