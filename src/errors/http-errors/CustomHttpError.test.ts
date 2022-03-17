import CustomHttpError from './CustomHttpError'

describe('CustomHttpError', () => {
  test('Should correctly create an instance of CustomHttpError', () => {
    const message = 'Test CustomHttpError message'
    const status = 100
    const errorName = 'Test CustomHttpError errorName'
    const customHttpError = new CustomHttpError(message, status, errorName)
    expect(customHttpError).toBeInstanceOf(CustomHttpError)
    expect(customHttpError.status).toEqual(status)
    expect(customHttpError.errorName).toEqual(errorName)
    expect(customHttpError.message).toEqual(message)
  })
})
