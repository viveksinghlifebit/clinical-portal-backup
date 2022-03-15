const requireProcessEnv = (name: string): string => {
  if (!process.env[name] || ['None', ''].includes(process.env[name] as string)) {
    throw new Error(`You must set the ${name} environment variable`)
  }
  return process.env[name] as string
}

const config: App.Config = {
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  masterKey: requireProcessEnv('MASTER_KEY'),
  jwtSecret: requireProcessEnv('JWT_SECRET'),
  mongoMulti: {
    mongooseUsers: {
      uri: process.env.LIFEBIT_MONGODB_URI_USERS,
      options: {
        debug: false
      }
    },
    mongooseFilters: {
      uri: process.env.LIFEBIT_MONGODB_URI_FILTERS,
      options: {
        debug: false
      }
    },
    mongooseExport: {
      uri: process.env.LIFEBIT_MONGODB_URI_EXPORT,
      options: {
        debug: false
      }
    },
    mongooseParticipants: {
      uri: process.env.LIFEBIT_MONGODB_URI_PARTICIPANTS,
      options: {
        debug: false
      }
    },
    mongooseGenomarkers: {
      uri: process.env.LIFEBIT_MONGODB_URI_GENOMARKERS
    },
    mongooseMaster: {
      uri: process.env.LIFEBIT_MONGODB_URI_MASTER
    }
  }
}

export default config
