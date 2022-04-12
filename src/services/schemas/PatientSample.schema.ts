import { Types, Schema, SchemaTypeOptions } from 'mongoose';
import { SampleQCStatus } from 'enums';

const labPortalFailureErrorRaw = {
  reason: { type: String },
  date: { type: Date }
};
const LabPortalFailureSchema = new Schema(labPortalFailureErrorRaw);

// TODO: Need to remove qcStatus once we enable SAMPLE_SEQUENCING_LIBRARY_ENABLED
const patientSampleSchema: Partial<Record<keyof PatientSample.Attributes, SchemaTypeOptions<unknown>>> = {
  patient: {
    type: Types.ObjectId,
    ref: 'Patient'
  },
  sampleId: {
    type: String,
    required: true,
    index: true,
    immutable: true,
    unique: true
  },
  type: {
    type: String,
    required: true
  },
  barcode: {
    type: String,
    immutable: true,
    unique: true
  },
  igvFile: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  owner: {
    type: Types.ObjectId,
    required: true
  },
  i: {
    type: String,
    required: true,
    immutable: true
  },
  labPortalID: { type: String, index: true },
  qcStatus: {
    type: String,
    enum: Object.values(SampleQCStatus)
  },
  qcStatusUpdateAt: {
    type: Date
  },
  qcJobLink: {
    type: String
  },
  registrationDate: {
    type: Date
  },
  labPortalSyncFailures: [LabPortalFailureSchema]
};

const PatientSampleSchema = new Schema(patientSampleSchema, { timestamps: true });
PatientSampleSchema.index({ patient: 1, qcStatus: 1 });

export { PatientSampleSchema };
