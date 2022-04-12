import { Schema, SchemaTypeOptions } from 'mongoose';

const patientWorkgroupSchema: Partial<Record<keyof PatientWorkgroup.Attributes, SchemaTypeOptions<unknown>>> = {
  workgroup: {
    type: Schema.Types.ObjectId,
    ref: 'Workgroup',
    required: true,
    index: true
  },
  description: { type: String },
  markers: [
    {
      cn: { type: String },
      location: { type: String }
    }
  ],
  markersDefinition: [{ type: Schema.Types.Mixed }],
  tierSNV: {
    tier1: Number,
    tier2: Number,
    tier3: Number
  },
  diseaseGene: { type: Schema.Types.Mixed },
  igvFiles: [{ type: String }],
  associatedDiseasesWithTieredVariants: [{ type: Schema.Types.Mixed }],
  comparisonFilters: [
    {
      type: Schema.Types.ObjectId,
      ref: 'PhenotypeField',
      required: false,
      index: false
    }
  ],
  patient: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  fields: [
    {
      readOnly: Boolean,
      filterId: Number,
      label: String,
      value: String,
      instance: [String],
      array: [String],
      instanceNames: [String],
      userAdded: {
        type: Boolean,
        default: false
      }
    }
  ]
};

const PatientWorkgroupSchema = new Schema(patientWorkgroupSchema, { timestamps: true });
export { PatientWorkgroupSchema };
