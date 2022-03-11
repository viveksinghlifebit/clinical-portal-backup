import { HttpStatusCodes } from 'enums'

import ResponseValidationHttpError from './ResponseValidationHttpError'

describe('ResponseValidationHttpError', () => {
  test('Should correctly create an instance of ResponseValidationHttpError', () => {
    const message = 'Test ResponseValidationHttpError message'
    const details = [{}]
    const responseValidationHttpError = new ResponseValidationHttpError(message, details)
    expect(responseValidationHttpError).toBeInstanceOf(ResponseValidationHttpError)
    expect(responseValidationHttpError.status).toEqual(HttpStatusCodes.InternalServerError)
    expect(responseValidationHttpError.errorName).toEqual(HttpStatusCodes[HttpStatusCodes.InternalServerError])
    expect(responseValidationHttpError.message).toEqual(message)
    expect(responseValidationHttpError.details).toEqual(details)
  })
})
