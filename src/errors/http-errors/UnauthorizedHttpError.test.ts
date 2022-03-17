import { HttpStatusCodes } from 'enums'

import UnauthorizedHttpError from './UnauthorizedHttpError'

describe('UnauthorizedHttpError', () => {
  test('Should correctly create an instance of UnauthorizedHttpError', () => {
    const message = 'Test UnauthorizedHttpError message'
    const unauthorizedHttpError = new UnauthorizedHttpError(message)
    expect(unauthorizedHttpError).toBeInstanceOf(UnauthorizedHttpError)
    expect(unauthorizedHttpError.status).toEqual(HttpStatusCodes.Unauthorized)
    expect(unauthorizedHttpError.errorName).toEqual(HttpStatusCodes[HttpStatusCodes.Unauthorized])
    expect(unauthorizedHttpError.message).toEqual(message)
  })
})
