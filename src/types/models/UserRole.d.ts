declare namespace UserRole {
  interface Attributes {
    userId: Mongoose.ObjectId;
    team: Mongoose.ObjectId;
    rolesIds: Mongoose.ObjectId[] | Role.View[];
    createdAt: Date;
    updatedAt: Date;
  }

  interface Document extends Attributes, Mongoose.Document {
    view(): View;
  }

  interface Model extends Mongoose.Model<Document> {
    findByUserAndTeamId(userId: Mongoose.ObjectId, teamId: Mongoose.ObjectId): Promise<UserRole.View | void>;
    getUserRolesWithRolesByAggregation({
      users,
      team
    }: {
      users: Mongoose.ObjectId[];
      team: Mongoose.ObjectId;
    }): Promise<UserRole.View[]>;
  }

  interface View {
    _id: string;
    userId: string;
    team: string;
    roles: string[] | Role.View[];
  }

  interface RolesPopulatedView {
    id?: string;
    email?: string;
    name: string;
    surname?: string;
    teamName: string;
    roles: { name: string; displayName: string }[];
  }
}
