declare namespace InvitationUserRole {
  interface Attributes {
    email: string
    team: Mongoose.ObjectId
    rolesIds: Mongoose.ObjectId[] | Role.View[]
    isInvitationAccepted: boolean
    createdAt: Date
    updatedAt: Date
  }

  interface Document extends Attributes, Mongoose.Document {
    view(): View
  }

  interface Model extends Mongoose.Model<Document> {
    //
  }

  interface View {
    _id: string
    email: string
    team: string
    isInvitationAccepted: boolean
    roles: string[] | Role.View[]
  }

  interface InviteRequest {
    email: string
    roles: string[]
  }
}
