import { Types, SchemaTypeOptions, Schema } from 'mongoose';

const patientSampleAliquotSchema: Partial<Record<keyof PatientSampleAliquot.Attributes, SchemaTypeOptions<unknown>>> = {
  patient: {
    type: Types.ObjectId,
    ref: 'Patient'
  },
  patientSample: {
    type: Types.ObjectId,
    ref: 'PatientSample',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  labPortalID: { type: String, index: true, required: true }
};

const PatientSampleAliquotSchema = new Schema(patientSampleAliquotSchema, {
  timestamps: true
});

export { PatientSampleAliquotSchema };
