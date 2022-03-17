declare namespace Mongoose {
  type Connection = import('mongoose').Connection
  type Document = import('mongoose').Document
  type Model<T> = import('mongoose').Model<T>
  type ObjectId = import('mongoose').Types.ObjectId

  type QueryConditions = Record<string, unknown>

  type ProjectConditions = Record<string, 0 | 1>
  interface Config {
    uri: string | undefined
    options?: Record<string, unknown>
  }

  interface Multi {
    mongooseUsers: Config
    mongooseFilters: Config
    mongooseExport: Config
    mongooseParticipants: Config
    mongooseGenomarkers: Config
    mongooseClinicalPortal: Config
  }

  interface Connections {
    clinicalPortalConnection: Connection
    usersConnection: Connection
    // filtersConnection: Connection
    exportConnection: Connection
    participantsConnection: Connection
    genomarkersConnection: Connection
  }
}
