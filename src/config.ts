import { castEnvToBoolOrUseDefault, requireProcessEnv } from 'utils';

const config: App.Config = {
  apiPrefix: process.env.PATH_PREFIX ?? '/clinical-portal/v1',
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
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
    mongooseClinicalPortal: {
      uri: process.env.LIFEBIT_MONGODB_URI_CLINICAL_PORTAL
    }
  },
  hkgiEnvironmentEnabled: castEnvToBoolOrUseDefault('HKGI_ENVIRONMENT_ENABLED', false),
  adminTeamId: process.env.ADMIN_TEAM_ID ?? '5f7c8696d6ea46288645a89f',
  mongooseFieldsEncryption: {
    enabled: process.env.MONGOOSE_FIELD_ENCRYPTION_ENABLED === 'true',
    salt: process.env.MONGOOSE_FIELD_ENCRYPTION_SALT || '', // must be a hex value of a random 16 byte buffer
    secret: process.env.MONGOOSE_FIELD_ENCRYPTION_SECRET || '' // must be a hex value of a random 32 byte buffer
  },
  individualBrowser: {
    patient: {
      initFilters: [
        {
          filterId: 1000,
          instance: ['0'],
          label: 'HPO terms:'
        },
        {
          filterId: 4,
          instance: ['0'],
          array: ['0'],
          label: 'Sex:'
        },
        {
          filterId: 1,
          instance: ['0'],
          array: ['0'],
          label: 'Ethnicity:'
        }
      ]
    }
  },
  clinicalPortal: {
    s3PatientSampleIgvFileBucket: process.env.S3_PATIENT_SAMPLE_IGV_FILE_BUCKET || 's3://igv/outputs'
  },
  phenotypeNestedListReturnFlat: castEnvToBoolOrUseDefault('PHENOTYPE_NESTED_LIST_RETURN_FLAT', false),
  featureFlags: {
    BARS_STRING_VALUES: castEnvToBoolOrUseDefault('BARS_STRING_VALUES', false)
  }
};

export default config;
