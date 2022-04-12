import { Schema, Types, SchemaTypeOptions } from 'mongoose';
import { SampleQCStatus } from 'enums';

const patientSampleSequencingLibrarySchema: Partial<
  Record<keyof PatientSampleSequencingLibrary.Attributes, SchemaTypeOptions<unknown>>
> = {
  sample: {
    type: Types.ObjectId,
    ref: 'PatientSampleAliquot',
    required: true,
    index: true
  },
  patient: {
    type: Types.ObjectId,
    ref: 'Patient'
  },
  owner: {
    type: Types.ObjectId,
    required: true
  },
  sequencingId: {
    type: String,
    index: true,
    immutable: true,
    unique: true
  },
  igvFile: {
    type: String,
    required: true
  },
  i: {
    type: String,
    required: true,
    immutable: true
  },
  libraryNumber: {
    type: String
  },
  date: {
    type: Date
  },
  operator: {
    type: String
  },
  labPortalID: { type: String, index: true },
  libraryKitType: { type: String },
  sampleAliquot: { type: Types.ObjectId, ref: 'PatientSampleAliquot' },
  extractedSample: { type: Types.ObjectId, ref: 'ExtractedPatientSample' },
  qcStatus: {
    type: String,
    enum: Object.values(SampleQCStatus)
  },
  qcStatusUpdateAt: {
    type: Date
  },
  qcJobLink: {
    type: String
  }
};

const PatientSampleSequencingLibrarySchema = new Schema(patientSampleSequencingLibrarySchema, {
  timestamps: true
});
PatientSampleSequencingLibrarySchema.index({ patient: 1, qcStatus: 1 });

export { PatientSampleSequencingLibrarySchema };
