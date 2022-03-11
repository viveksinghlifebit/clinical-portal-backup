import { HttpStatusCodes } from 'enums'

import BadRequestHttpError from './BadRequestHttpError'

describe('BadRequestHttpError', () => {
  test('Should correctly create an instance of BadRequestHttpError', () => {
    const message = 'Test BadRequestHttpError message'
    const badRequestHttpError = new BadRequestHttpError(message)
    expect(badRequestHttpError).toBeInstanceOf(BadRequestHttpError)
    expect(badRequestHttpError.status).toEqual(HttpStatusCodes.BadRequest)
    expect(badRequestHttpError.errorName).toEqual(HttpStatusCodes[HttpStatusCodes.BadRequest])
    expect(badRequestHttpError.message).toEqual(message)
  })
})
