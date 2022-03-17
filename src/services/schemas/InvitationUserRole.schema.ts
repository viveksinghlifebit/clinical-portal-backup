import { Schema, SchemaTypeOptions } from 'mongoose'

const invitationUserRoleSchema: Partial<Record<keyof InvitationUserRole.Attributes, SchemaTypeOptions<unknown>>> = {
  email: {
    type: Schema.Types.String,
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
  ],
  isInvitationAccepted: {
    type: Schema.Types.Boolean,
    required: true
  }
}

const InvitationUserRoleSchema = new Schema(invitationUserRoleSchema, { timestamps: true })
InvitationUserRoleSchema.index({ email: 1, team: 1 }, { unique: true })

export { InvitationUserRoleSchema }
