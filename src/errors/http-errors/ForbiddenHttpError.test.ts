import { HttpStatusCodes } from 'enums'

import ForbiddenHttpError from './ForbiddenHttpError'

describe('ForbiddenHttpError', () => {
  test('Should correctly create an instance of ForbiddenHttpError', () => {
    const message = 'Test ForbiddenHttpError message'
    const forbiddenHttpError = new ForbiddenHttpError(message)
    expect(forbiddenHttpError).toBeInstanceOf(ForbiddenHttpError)
    expect(forbiddenHttpError.status).toEqual(HttpStatusCodes.Forbidden)
    expect(forbiddenHttpError.errorName).toEqual(HttpStatusCodes[HttpStatusCodes.Forbidden])
    expect(forbiddenHttpError.message).toEqual(message)
  })

  test('Should correctly create an instance of ForbiddenHttpError with message as Forbidden if not passed', () => {
    const forbiddenHttpError = new ForbiddenHttpError()
    expect(forbiddenHttpError).toBeInstanceOf(ForbiddenHttpError)
    expect(forbiddenHttpError.status).toEqual(HttpStatusCodes.Forbidden)
    expect(forbiddenHttpError.errorName).toEqual(HttpStatusCodes[HttpStatusCodes.Forbidden])
    expect(forbiddenHttpError.message).toEqual('Forbidden.')
  })
})
