declare namespace App {
  interface State {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Context<Body = any> {
    request: { body: Body };
  }

  interface Config {
    apiPrefix: string;
    port: number;
    jwtSecret: string;
    mongoMulti: Mongoose.Multi;
    hkgiEnvironmentEnabled: boolean;
    adminTeamId: string;
    mongooseFieldsEncryption: MongooseEncryption;
    individualBrowser: IndividualBrowserConfig;
    clinicalPortal: ClinicalPortalConfig;
  }

  type MongooseEncryption = {
    enabled: boolean;
    salt: string;
    secret: string;
  };

  interface IndividualBrowserConfig {
    patient: {
      initFilters: { filterId: number; instance: string[]; label: string; array?: string[] }[];
    };
  }

  interface ClinicalPortalConfig {
    s3PatientSampleIgvFileBucket: string;
  }
}
