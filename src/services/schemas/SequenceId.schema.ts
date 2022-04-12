import { SchemaTypeOptions, Schema } from 'mongoose';

const sequenceIdSchema: Partial<Record<keyof SequenceId.Attributes, SchemaTypeOptions<unknown>>> = {
  name: {
    type: String,
    immutable: true,
    unique: true
  },
  prefix: {
    type: String,
    immutable: true
  },
  value: {
    type: Number
  }
};

const SequenceIdSchema = new Schema(sequenceIdSchema, { timestamps: false });

export { SequenceIdSchema };
