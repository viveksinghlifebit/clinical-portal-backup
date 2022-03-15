jest.mock('../src/services/log')
jest.mock('../src/api/middlewares/auth', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  auth: jest.fn(() => async (req: any, next: any) => {
    req.user = { _id: 'someUserId' }
    next()
  })
}))

const setupRequiredProcessEnv = (): void => {
  process.env.MASTER_KEY = 'test'
  process.env.JWT_SECRET = 'test'
}

setupRequiredProcessEnv()
