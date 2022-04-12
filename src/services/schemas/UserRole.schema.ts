import { Schema, SchemaTypeOptions } from 'mongoose';

const userRoleSchema: Partial<Record<keyof UserRole.Attributes, SchemaTypeOptions<unknown>>> = {
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true
  },
  team: {
    type: Schema.Types.ObjectId,
    required: true
  },
  rolesIds: [
    {
      ref: 'Role',
      type: Schema.Types.ObjectId,
      required: true
    }
  ]
};

const UserRoleSchema = new Schema(userRoleSchema, { timestamps: true });
UserRoleSchema.index({ userId: 1, team: 1 }, { unique: true });

export { UserRoleSchema };
