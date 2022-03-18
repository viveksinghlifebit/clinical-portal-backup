import { DeploitError, NotImplementedError } from 'errors'

describe('Errors', () => {
  describe('NotImplementedError', () => {
    test('should give NotImplementedError instance', () => {
      const error = new NotImplementedError()
      expect(error.message).toBe('Not implemented.')
      expect(error).toBeInstanceOf(NotImplementedError)
      expect(error).toBeInstanceOf(DeploitError)
    })
  })
})
