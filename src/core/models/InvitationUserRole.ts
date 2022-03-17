import { InvitationUserRoleSchema } from '@schemas'

export const invitationUserRoleModelName = 'InvitationUserRole'

/**
 * MODEL METHODS
 */

function view(this: InvitationUserRole.Document): InvitationUserRole.View {
  return {
    _id: this._id.toHexString(),
    email: this.email,
    team: this.team.toHexString(),
    roles: (this.rolesIds as Mongoose.ObjectId[]).map(String),
    isInvitationAccepted: this.isInvitationAccepted
  }
}

InvitationUserRoleSchema.methods = {
  view
}

/**
 * MODEL INITIALIZATION
 */

export let InvitationUserRole: InvitationUserRole.Model

export const init = (connection: Mongoose.Connection): void => {
  InvitationUserRole = connection.model<InvitationUserRole.Document, InvitationUserRole.Model>(
    invitationUserRoleModelName,
    InvitationUserRoleSchema
  )
}
