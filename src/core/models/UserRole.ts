import { UserRoleSchema } from '@schemas'

export const userRoleModelName = 'UserRole'

/**
 * MODEL METHODS
 */

function view(this: UserRole.Document): UserRole.View {
  return {
    _id: this._id.toHexString(),
    userId: this.userId.toHexString(),
    team: this.team.toHexString(),
    roles: (this.rolesIds as Mongoose.ObjectId[]).map(String)
  }
}

UserRoleSchema.methods = {
  view
}

/**
 * MODEL Static Methods
 */
async function findByUserAndTeamId(
  userId: Mongoose.ObjectId,
  teamId: Mongoose.ObjectId
): Promise<UserRole.View | null> {
  const userRole = await UserRole.findOne({
    userId: userId,
    team: teamId
  })

  if (userRole) {
    return userRole.view()
  }

  return null
}

async function getUserRolesWithRolesByAggregation({
  users,
  team
}: {
  users: Mongoose.ObjectId[]
  team: Mongoose.ObjectId
}): Promise<UserRole.View[]> {
  return UserRole.aggregate([
    {
      $match: {
        userId: { $in: users },
        team
      }
    },
    {
      $lookup: {
        from: 'roles',
        localField: 'rolesIds',
        foreignField: '_id',
        as: 'roles'
      }
    },
    {
      $project: {
        _id: 1,
        team: 1,
        userId: 1,
        'roles.displayName': 1,
        'roles.name': 1,
        'roles.permissions': 1
      }
    }
  ])
}

UserRoleSchema.statics = {
  findByUserAndTeamId,
  getUserRolesWithRolesByAggregation
}

/**
 * MODEL INITIALIZATION
 */

export let UserRole: UserRole.Model

export const init = (connection: Mongoose.Connection): void => {
  UserRole = connection.model<UserRole.Document, UserRole.Model>(userRoleModelName, UserRoleSchema)
}
