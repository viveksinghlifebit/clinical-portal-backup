import { HttpStatusCodes } from 'enums'

import InternalServerErrorHttpError from './InternalServerErrorHttpError'

describe('InternalServerErrorHttpError', () => {
  test('Should correctly create an instance of InternalServerErrorHttpError', () => {
    const message = 'Test InternalServerErrorHttpError message'
    const sourceError = new Error('Test InternalServerErrorHttpError sourceError')
    const internalServerErrorHttpError = new InternalServerErrorHttpError(message, sourceError)
    expect(internalServerErrorHttpError).toBeInstanceOf(InternalServerErrorHttpError)
    expect(internalServerErrorHttpError.status).toEqual(HttpStatusCodes.InternalServerError)
    expect(internalServerErrorHttpError.errorName).toEqual(HttpStatusCodes[HttpStatusCodes.InternalServerError])
    expect(internalServerErrorHttpError.message).toEqual(message)
    expect(internalServerErrorHttpError.sourceError).toEqual(sourceError)
  })
})
