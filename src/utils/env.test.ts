import { castEnvToBoolOrUseDefault, requireProcessEnv } from './env'

describe('Env-utils', () => {
  describe('castEnvToBoolOrUseDefault', () => {
    test('should return default value as a boolean if envVariable is not present', () => {
      expect(castEnvToBoolOrUseDefault('not-present', true)).toBeTruthy()
    })

    test('should return value as a boolean if envVariable is present', () => {
      process.env.present = 'false'
      expect(castEnvToBoolOrUseDefault('present', true)).toBeFalsy()

      delete process.env.present
    })
  })

  describe('requireProcessEnv', () => {
    test('should throw error if env var is not present if its required', () => {
      expect(() => requireProcessEnv('not-present')).toThrowError(
        new Error(`You must set the not-present environment variable`)
      )
    })
  })
})
