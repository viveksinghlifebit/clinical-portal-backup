import mongoose, { Schema, SchemaTypeOptions, Model } from 'mongoose';

import { PatientReferringUserType, PatientStatus, PatientSubStatus, SampleAnalysisTypes } from 'enums';
import { registerEncryptionPlugin } from 'services/mongoose/encryption';
import config from 'config';

const { secret, salt, enabled: enableFieldEncryption } = config.mongooseFieldsEncryption;

const ConsentFormSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  consentType: {
    type: String,
    required: true
  },
  additionalFindings: {
    type: Boolean,
    required: true
  },
  futureResearch: {
    type: Boolean,
    required: true
  },
  signedAt: {
    type: Date,
    required: true
  },
  minorSignedAt: { type: Date },
  version: {
    type: String,
    required: true
  },
  bucket: {
    type: String,
    required: false
  },
  key: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    required: true
  },
  patientFile: {
    type: Schema.Types.ObjectId,
    ref: 'PatientFile'
  }
});

const addressSchemaRaw = {
  address1: { type: String },
  address2: { type: String },
  cityAndCountry: { type: String },
  area: { type: String }
};
const AddressSchema = new mongoose.Schema(addressSchemaRaw);

const labPortalFailureErrorRaw = {
  reason: { type: String },
  date: { type: Date }
};
const LabPortalFailureSchema = new mongoose.Schema(labPortalFailureErrorRaw);

registerEncryptionPlugin({
  featureFlag: enableFieldEncryption,
  fields: ['address1', 'address2', 'cityAndCountry', 'area'],
  salt,
  schemaLabel: 'PatientSchema.AddressSchema',
  schema: AddressSchema,
  secret
});

const nextOfKinsSchemaRaw = {
  name: { type: String },
  email: { type: String },
  phoneNumber: { type: String },
  addresses: [AddressSchema],
  relationship: { type: String }
};
const NextOfKinsSchema = new mongoose.Schema(nextOfKinsSchemaRaw);
registerEncryptionPlugin({
  featureFlag: enableFieldEncryption,
  fields: ['name', 'email', 'phoneNumber', 'relationship'],
  salt,
  schemaLabel: 'PatientSchema.NextOfKinsSchema',
  schema: NextOfKinsSchema,
  secret
});

const DateOfBirthSchema = new mongoose.Schema({
  year: { type: String },
  month: { type: String },
  day: { type: String }
});

const ReferringUserSchema = new mongoose.Schema({
  type: { type: String, enum: Object.values(PatientReferringUserType), required: true },
  name: { type: String, required: true }
});
registerEncryptionPlugin({
  featureFlag: enableFieldEncryption,
  fields: ['year', 'month', 'day'],
  salt,
  schemaLabel: 'PatientSchema.DateOfBirthSchema',
  schema: DateOfBirthSchema,
  secret
});

const patientSchema: Partial<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Record<keyof Patient.Attributes, SchemaTypeOptions<unknown> | Schema<any, Model<any, any, any, any>, any, any>>
> = {
  i: {
    type: String,
    immutable: true,
    unique: true
  },
  externalID: {
    type: String,
    required: true,
    unique: true
  },
  externalIDType: {
    type: String,
    required: true
  },
  hospitalRef: {
    type: String
    // required: true
  },
  status: {
    type: String,
    default: PatientStatus.Drafted,
    enum: Object.values(PatientStatus)
  },
  subStatus: {
    type: String,
    enum: Object.values(PatientSubStatus)
  },
  name: { type: String },
  surname: { type: String },
  chineseName: { type: String },
  chineseSurname: { type: String },
  dateOfBirth: DateOfBirthSchema,
  email: { type: String },
  phoneNumber: { type: String },
  addresses: [AddressSchema],
  familyId: {
    type: mongoose.Types.ObjectId,
    ref: 'Family'
  },
  owner: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  team: { type: mongoose.Types.ObjectId },
  consentForms: [ConsentFormSchema],
  // TODO: improve schema once implemented
  images: [{ location: { type: String } }],
  // TODO: improve schema once implemented
  reports: [{ location: { type: String } }],
  associatedDiseasesWithTieredVariants: [{ type: mongoose.Schema.Types.Mixed }],
  diseaseGene: { type: mongoose.Schema.Types.Mixed },
  labPortalID: { type: String, index: true },
  nextsOfKin: [NextOfKinsSchema],
  analysisEligibleTypes: [
    {
      type: String,
      enum: Object.values(SampleAnalysisTypes)
    }
  ],
  referringUsers: [ReferringUserSchema],
  analysisEligibleTypesOthers: {
    type: String
  },
  updatedBy: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  dateOfEnrollment: {
    type: Date
  },
  labPortalSyncFailures: [LabPortalFailureSchema],
  lastExportAt: {
    type: Date,
    index: true
  }
};

const PatientSchema = new mongoose.Schema(patientSchema, { timestamps: true });

export const searchableEncryptedFields = [
  'externalID',
  'name',
  'surname',
  'chineseName',
  'chineseSurname',
  'email',
  'phoneNumber',
  'dateOfBirth.year'
];

registerEncryptionPlugin({
  featureFlag: enableFieldEncryption,
  fields: ['externalID', 'name', 'surname', 'chineseName', 'chineseSurname', 'email', 'phoneNumber'],
  salt,
  schemaLabel: 'PatientSchema',
  schema: PatientSchema,
  secret
});

export { PatientSchema, AddressSchema, NextOfKinsSchema, DateOfBirthSchema, addressSchemaRaw, nextOfKinsSchemaRaw };
