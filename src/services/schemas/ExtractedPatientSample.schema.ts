import { Types, Schema, SchemaTypeOptions } from 'mongoose';

const extractedPatientSampleSchema: Partial<
  Record<keyof ExtractedPatientSample.Attributes, SchemaTypeOptions<unknown>>
> = {
  patient: {
    type: Types.ObjectId,
    ref: 'Patient'
  },
  subClass: {
    type: String
  },
  sampleAliquot: {
    type: Types.ObjectId,
    ref: 'PatientSampleAliquot',
    required: true,
    index: true
  },
  extractionKitType: {
    type: String
  },
  extractionLocation: {
    type: String
  },
  extractionMethod: {
    type: String
  },
  patientSample: {
    type: Types.ObjectId,
    ref: 'PatientSample',
    required: true,
    index: true
  },
  labPortalID: { type: String, index: true, required: true },
  name: { type: String, required: true }
};

const ExtractedPatientSampleSchema = new Schema(extractedPatientSampleSchema, {
  timestamps: true
});

export { ExtractedPatientSampleSchema };
