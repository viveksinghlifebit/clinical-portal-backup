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
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { default: config } = require('config')
    expect(config.port).toEqual(8080)
  })

  test('When no environment variables are provided, then config should have default values.', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { default: config } = require('config')
    expect(config.port).toEqual(3000)
  })
})
