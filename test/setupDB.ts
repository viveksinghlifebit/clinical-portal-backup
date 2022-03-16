import { MongoMemoryServer } from 'mongodb-memory-server'
import * as models from '../src/core/models'
import * as connections from '../src/services/mongoose/connections'
import mongoose, { Mongoose } from 'mongoose'

export const setupDB = async (): Promise<{
  mongoServer: MongoMemoryServer
  mongoORM: Mongoose
}> => {
  const mongoServer = await MongoMemoryServer.create({ binary: { version: '3.6.12' } })
  const mongoUri = mongoServer.getUri('test-db')
  const mongoConn = mongoose.createConnection(mongoUri)
  const multiConnection = {
    masterConnection: mongoConn,
    usersConnection: mongoConn,
    exportConnection: mongoConn,
    participantsConnection: mongoConn,
    genomarkersConnection: mongoConn
  }

  models.init(multiConnection)
  connections.init({
    mongooseUsers: {
      uri: mongoUri
    },
    mongooseFilters: {
      uri: mongoUri
    },
    mongooseExport: {
      uri: mongoUri
    },
    mongooseParticipants: {
      uri: mongoUri
    },
    mongooseGenomarkers: {
      uri: mongoUri
    },
    mongooseMaster: {
      uri: mongoUri
    }
  })
  // jest.spyOn(connections, 'exportConnection').mockReturnValue(mongoConn)
  // jest.spyOn(connections, 'genomarkersConnection').mockReturnValue(mongoConn)
  // jest.spyOn(connections, 'masterConnection').mockReturnValue(mongoConn)
  // jest.spyOn(connections, 'participantsConnection').mockReturnValue(mongoConn)

  await mongoose.connect(mongoUri)
  return { mongoServer, mongoORM: mongoose }
}

export const shutDownDB = async (mongoServer: MongoMemoryServer): Promise<void> => {
  await mongoose.disconnect()
  await mongoServer.stop()
}

export const cleanUpDB = async (mongooseORM: Mongoose): Promise<void> => {
  const collections = await mongooseORM.connection.db.listCollections().toArray()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const promises: Promise<any>[] = []
  collections.forEach((collection) => {
    promises.push(mongooseORM.connection.db.collection(collection.name).deleteMany({}))
  })
  await Promise.all(promises)
}
