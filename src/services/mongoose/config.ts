import config from 'config'

export const db = {
  mongooseUsers: {
    url: config.mongoMulti.mongooseUsers.uri
  },
  mongooseFilters: {
    url: config.mongoMulti.mongooseFilters.uri
  },
  mongooseExport: {
    url: config.mongoMulti.mongooseExport.uri
  },
  mongooseParticipants: {
    url: config.mongoMulti.mongooseParticipants.uri
  },
  mongooseGenomarkers: {
    url: config.mongoMulti.mongooseGenomarkers.uri
  },
  mongooseMaster: {
    url: config.mongoMulti.mongooseMaster.uri
  }
}
