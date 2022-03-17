declare namespace Role {
  interface Attributes extends Input, Mongoose.Document {
    createdAt: Date
    updatedAt: Date
  }

  interface Document extends Attributes, Mongoose.Document {
    view(): View
  }

  interface Model extends Mongoose.Model<Document> {
    findRolesByRoleIds(rolesIds: string[]): Promise<Role.View[]>
  }

  interface View {
    name: Role.Attributes['name']
    displayName: Role.Attributes['displayName']
    permissions: Role.Attributes['permissions']
  }

  interface Input {
    name: string
    displayName: string
    permissions: RoleBaseAccessPermission[]
  }

  interface RoleBaseAccessPermission {
    name: string
    access: {
      read?: boolean
      create?: boolean
      update?: boolean
      delete?: boolean
    }
  }
}
