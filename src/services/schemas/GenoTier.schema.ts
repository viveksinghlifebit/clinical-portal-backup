import { Schema } from 'mongoose';

const GenoTierSchema = new Schema(
  {
    i: { type: String },
    expireAt: { type: Date }
  },
  { timestamps: true }
);
GenoTierSchema.index({ '$**': 1 });
GenoTierSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

export { GenoTierSchema };
