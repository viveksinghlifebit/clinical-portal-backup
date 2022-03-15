import mongoose from 'mongoose'
import { log } from 'services/log'
// TODO: Uncomments connections once Models & Repositories are migrated to the new struture
export let masterConnection: Mongoose.Connection
export let usersConnection: Mongoose.Connection
export let exportConnection: Mongoose.Connection
export let participantsConnection: Mongoose.Connection
export let genomarkersConnection: Mongoose.Connection

const logConnected = (name: string): void => {
  log.info('[mongoose-multi] DB ' + name + ' connected')
}

export const init = async (mongoMulti: Mongoose.Multi): Promise<void> => {
  const [masterConn, usersConn, exportConn, participantsConn, genomarkersConn] = await Promise.all([
    mongoose.createConnection(`${mongoMulti.mongooseMaster.uri}`).on('connected', () => logConnected('MASTER')),
    mongoose.createConnection(`${mongoMulti.mongooseUsers.uri}`).on('connected', () => logConnected('USER')),
    // mongoose.createConnection(mongoMulti.mongooseFilters.uri, {
    //   ...options,
    //   ...mongoMulti.mongooseFilters.options
    // }),
    mongoose.createConnection(`${mongoMulti.mongooseExport.uri}`).on('connected', () => logConnected('EXPORT')),
    mongoose
      .createConnection(`${mongoMulti.mongooseParticipants.uri}`)
      .on('connected', () => logConnected('PARTICIPANTS')),
    mongoose
      .createConnection(`${mongoMulti.mongooseGenomarkers.uri}`)
      .on('connected', () => logConnected('GENOMARKERS'))
  ])

  masterConnection = masterConn
  usersConnection = usersConn
  // filtersConnection = filtersConn
  exportConnection = exportConn
  participantsConnection = participantsConn
  genomarkersConnection = genomarkersConn
}
