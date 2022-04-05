import { Schema, SchemaTypeOptions } from 'mongoose'

const workgroupSchema: Partial<Record<keyof Workgroup.Attributes, SchemaTypeOptions<unknown>>> = {
  name: {
    type: Schema.Types.String,
    required: true,
    index: true
  },
  numberOfPatients: {
    type: Schema.Types.Number,
    required: true
  },
  team: {
    type: Schema.Types.ObjectId,
    required: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    required: true
  }
}

const WorkgroupSchema = new Schema(workgroupSchema, { timestamps: true })
// UserRoleSchema.index({ userId: 1, team: 1 }, { unique: true })

export { WorkgroupSchema }
