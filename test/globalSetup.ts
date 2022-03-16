import { MongoMemoryServer } from 'mongodb-memory-server'

const setup = async (): Promise<void> => {
  const mongoServer = await MongoMemoryServer.create({ binary: { version: '3.6.12' } })
  await mongoServer.stop()
}

export default setup
