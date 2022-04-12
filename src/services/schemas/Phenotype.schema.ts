import { Schema, SchemaTypeOptions } from 'mongoose';
import { PhenotypeFieldTypes, PhenotypeFieldValueTypes } from 'enums';

const phenotypeFieldSchema: Record<
  keyof PhenotypeField.Attributes,
  SchemaTypeOptions<unknown> | typeof Schema.Types.Mixed
> = {
  _id: {
    type: Schema.Types.ObjectId
  },
  id: {
    type: Schema.Types.Mixed,
    index: true
  },
  name: {
    type: String,
    index: true,
    trim: true
  },
  bucket300: { type: Boolean, default: false },
  bucket500: { type: Boolean, default: false },
  categoryPathLevel1: { type: String },
  categoryPathLevel2: { type: String },
  categoryPathLevel3: { type: String },
  categoryPathLevel4: { type: String },
  instances: { type: Number },
  type: { type: String, enum: Object.values(PhenotypeFieldTypes) },
  Sorting: { type: String },
  valueType: { type: String, enum: Object.values(PhenotypeFieldValueTypes) },
  units: { type: String },
  coding: { type: String },
  description: { type: String },
  descriptionParticipantsNo: { type: String },
  link: { type: String },
  array: { type: Number },
  descriptionStability: { type: String },
  descriptionCategoryID: { type: String },
  descriptionItemType: { type: String },
  descriptionStrata: { type: String },
  descriptionSexed: { type: String },
  orderPhenotype: { type: String },
  instance0Name: { type: String },
  instance1Name: { type: String },
  instance2Name: { type: String },
  instance3Name: { type: String },
  instance4Name: { type: String },
  instance5Name: { type: String },
  instance6Name: { type: String },
  instance7Name: { type: String },
  instance8Name: { type: String },
  instance9Name: { type: String },
  instance10Name: { type: String },
  instance11Name: { type: String },
  instance12Name: { type: String },
  instance13Name: { type: String },
  instance14Name: { type: String },
  instance15Name: { type: String },
  instance16Name: { type: String },
  values: Schema.Types.Mixed,
  Original_dataset: { type: String }
};
const PhenotypeFieldSchema = new Schema(phenotypeFieldSchema, { timestamps: true });
export { PhenotypeFieldSchema };
