import { MongoMemoryServer } from 'mongodb-memory-server'
import { cleanUpDB, setupDB } from './setupDB'
import mongoose, { Mongoose } from 'mongoose'
jest.setTimeout(60000)
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

let mongoServer: MongoMemoryServer
let mongoORM: Mongoose

beforeAll(async () => {
  const db = await setupDB()
  mongoServer = db.mongoServer
  mongoORM = db.mongoORM
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

afterEach(async () => {
  await cleanUpDB(mongoORM)
})
