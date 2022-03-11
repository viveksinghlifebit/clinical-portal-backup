describe('config', () => {
  beforeEach(() => {
    jest.resetModules()
    process.env = {
      ...process.env,
      PORT: undefined
    }
  })

  test('When environment variables are provided, then config should have their values.', () => {
    const port = 8080
    process.env.PORT = port.toString()
    const { default: config } = require('config')
    expect(config).toEqual({
      port
    })
  })

  test('When no environment variables are provided, then config should have default values.', () => {
    const { default: config } = require('config')
    expect(config).toEqual({
      port: 3000
    })
  })
})
