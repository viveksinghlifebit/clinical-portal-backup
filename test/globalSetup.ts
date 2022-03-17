import { MongoMemoryServer } from 'mongodb-memory-server'

const setup = async (): Promise<void> => {
  const mongoServer = await MongoMemoryServer.create()
  await mongoServer.stop()
}

export default setup
