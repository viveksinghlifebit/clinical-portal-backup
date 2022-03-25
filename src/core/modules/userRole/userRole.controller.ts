import mongoose from 'mongoose'
import { keyBy } from 'lodash'
import { log as logger } from 'services/log'

import { InvitationUserRole, Role, UserRole } from '@core/models'
import { IllegalArgumentError, InvalidStateError, ResourceNotFoundError } from 'errors'
import { MongoQuery } from '@core/mongoQuery'
import { UserRepository, TeamRepository } from '@core/repos'

export class UserRoleService {
  /**
   * List userRoles with pagination
   * @param {User} user user
   * @param {Team} team team
   * @param {PaginationRequest} pagination pagination options
   */
  static async listUserRolesPaginated({
    user,
    team
  }: {
    user: User
    team: Team
  }): Promise<App.PaginationResponse<UserRole.RolesPopulatedView>> {
    const mongoQuery = new MongoQuery(UserRole).withTeamOrOwner(user, team)

    const { query, sort } = await mongoQuery.compile()
    const userRoles = await UserRole.find(query).populate('rolesIds').sort(sort)
    const isUserRolesNotPresent = !userRoles || userRoles.length === 0
    const invitationUserRoles = await InvitationUserRole.find({ ...query, isInvitationAccepted: false })
      .populate('rolesIds')
      .sort(sort)
    const isInvitationUserRoleNotPresent = !invitationUserRoles || invitationUserRoles.length === 0
    if (isUserRolesNotPresent && isInvitationUserRoleNotPresent) {
      return {
        pageSize: 0,
        pageNumber: 0,
        totalCount: 0,
        totalPages: 0,
        data: []
      }
    }

    const onwersId = userRoles.map(({ userId }) => userId)
    const users = await UserRepository.find({ _id: { $in: onwersId } })
    const userMapper: Record<string, User> = keyBy(users, '_id')

    const data: UserRole.RolesPopulatedView[] = []
    for (const { userId, rolesIds } of userRoles) {
      if (String(userId) in userMapper) {
        const userDetails = userMapper[String(userId)] as User
        data.push({
          id: String(userId),
          name: userDetails.name,
          surname: userDetails.surname,
          teamName: team.name,
          roles: (rolesIds as Role.View[]).map(({ name, displayName }) => ({ name, displayName }))
        })
      }
    }

    if (invitationUserRoles.length > 0) {
      for (const { email, rolesIds } of invitationUserRoles) {
        data.push({
          email,
          name: 'Member',
          teamName: team.name,
          roles: (rolesIds as Role.View[]).map(({ name, displayName }) => ({ name, displayName }))
        })
      }
    }
    return {
      pageSize: data.length,
      pageNumber: 1,
      totalCount: data.length,
      totalPages: 1,
      data
    }
  }

  /**
   * Updates userRole
   * @param {string} userId owner
   * @param {string[]} roles RBAC roles
   * @param {Team} team team
   */
  static async updateUserRole({
    userId,
    roles,
    email,
    team
  }: {
    userId?: string
    roles: string[]
    email?: string
    team: Team
  }): Promise<UserRole.RolesPopulatedView> {
    const isValidUserId = mongoose.Types.ObjectId.isValid(`${userId}`)
    if (!isValidUserId && !email) {
      throw new IllegalArgumentError('email or userId is missing')
    }
    const selectedRoles = await Role.find({
      name: {
        $in: roles
      }
    })
    if (!selectedRoles || selectedRoles.length === 0) {
      throw new IllegalArgumentError('Role is invalid')
    }
    if (email) {
      // This case will only be applicable to users which are still in invite state
      const data = await InvitationUserRole.findOneAndUpdate(
        { email, team: team._id, isInvitationAccepted: false },
        { $set: { rolesIds: selectedRoles } }
      )
      if (!data) {
        const teamMemberShip = await TeamRepository.findOne({
          invitationEmail: email,
          team: team._id,
          status: 'pendingActivation'
        })
        if (!teamMemberShip) {
          logger.error(`User with email ${email} is not present in InvitationUserRole collection`)
          throw new IllegalArgumentError('User role cannot be updated')
        }
        const createInvitedUsers = {
          email,
          rolesIds: selectedRoles,
          isInvitationAccepted: false,
          team: team._id
        }
        await InvitationUserRole.create(createInvitedUsers)
      }
      return {
        name: 'Member',
        teamName: team.name,
        email,
        roles: selectedRoles.map(({ name, displayName }) => ({ name, displayName }))
      }
    }
    const data = await UserRole.findOneAndUpdate({ userId, team: team._id }, { $set: { rolesIds: selectedRoles } })
    if (!data) {
      logger.error(`User with userId: ${userId} and team: ${String(team._id)} is not present in UserRole`)
      throw new IllegalArgumentError('User role cannot be updated')
    }

    const user = await UserRepository.findOne({ _id: userId })
    if (!user) {
      logger.error(`User with userId ${userId} is not present in UserRepository`)
      throw new IllegalArgumentError('User is invalid')
    }

    return {
      id: String(data.userId),
      name: user.name,
      surname: user.surname,
      teamName: team.name,
      roles: selectedRoles.map(({ name, displayName }) => ({ name, displayName }))
    }
  }

  /**
   * Delete userRole
   * @param {string} userId owner
   * @param {Team} team team
   */
  static async deleteUserRole({ userId, team }: { userId: string; team: Team }): Promise<void> {
    await UserRole.deleteOne({ userId, team })
  }

  /**
   * Create userRole
   * @param {string} userId owner
   * @param {string[]} roles RBAC roles
   * @param {Team} team team
   */
  static async createUserRole({
    userId,
    roles,
    team
  }: {
    userId: string
    roles: string[]
    team: Team
  }): Promise<UserRole.RolesPopulatedView | null> {
    const user = await UserRepository.findOne({ _id: userId })
    if (!user) {
      return null
    }

    const selectedRoles = await Role.find({
      name: {
        $in: roles
      }
    })
    const userRole = await UserRole.create({
      userId,
      team: team._id,
      rolesIds: selectedRoles.map(({ _id }) => _id)
    })

    return {
      id: String(userRole.userId),
      name: user.name,
      surname: user.surname,
      teamName: team.name,
      roles: selectedRoles.map(({ name, displayName }) => ({ name, displayName }))
    }
  }

  /**
   * Create lowest privileged userRole in DB if not present
   * @param {user} user
   * @returns
   */
  static async createBaseUserRole({ user, team }: { user: User; team: Team }): Promise<UserRole.View> {
    const userInfo = await UserRepository.findById(String(user._id))
    if (!userInfo) {
      throw new InvalidStateError('User is invalid')
    }
    const userRole = await UserRole.findOne({ userId: user._id, team: team._id })
    if (!userRole) {
      const invitationUserRole = await InvitationUserRole.findOne({ email: userInfo.email, team: team._id })
      const rolesIds: (mongoose.Types.ObjectId | Role.Document)[] = []
      // This will enable the user to have dynamic clinical user role instead of default Nurse
      if (invitationUserRole) {
        const clinicalRole = invitationUserRole.rolesIds as mongoose.Types.ObjectId[]
        rolesIds.push(...clinicalRole)
      } else {
        const clinicalRole = (await Role.findOne({ name: 'Nurse' })) as Role.Document
        rolesIds.push(clinicalRole)
      }
      await UserRole.create({
        userId: user._id,
        team: team._id,
        rolesIds
      })
    }
    return this.getMyUserRole({ user, team })
  }

  /**
   * Get user roles permission
   * @param {user} user
   * @returns
   */
  static async getMyUserRole({ user, team }: { user: User; team: Team }): Promise<UserRole.View> {
    const [item] = await UserRole.getUserRolesWithRolesByAggregation({
      users: [user._id as mongoose.Types.ObjectId],
      team: team._id as mongoose.Types.ObjectId
    })
    if (!item) {
      throw new ResourceNotFoundError(`User role doesn't exists`)
    }
    return {
      _id: item._id,
      roles: item.roles,
      team: item.team,
      userId: item.userId
    }
  }

  /**
   * Get user roles permission
   * @param {user} user
   * @returns
   */
  static async getUsersRoles({ users, team }: { users: Mongoose.ObjectId[]; team: Team }): Promise<UserRole.View[]> {
    const items: UserRole.View[] = await UserRole.getUserRolesWithRolesByAggregation({
      users,
      team: team._id as mongoose.Types.ObjectId
    })
    return items.map((item) => ({
      _id: item._id,
      roles: (item.roles as Role.View[]).map((x) => x.displayName),
      team: item.team,
      userId: item.userId
    }))
  }

  /**
   * Creates clinical role for a specified user with email in the clinical portal
   * @param {InvitationUserRole.InviteRequest[]}  inviteUsers {email:string,roles:string[]}[]
   * @param {Team} team
   */
  static async invite(inviteUsers: InvitationUserRole.InviteRequest[], team: Team): Promise<void> {
    const uniqueRolesSet: Set<string> = new Set<string>()
    const invitedUniqueUsersSet: Set<string> = new Set<string>()
    for (const { email, roles } of inviteUsers) {
      roles.forEach((x) => uniqueRolesSet.add(x))
      invitedUniqueUsersSet.add(email.toLowerCase())
    }
    const uniqueRoles: string[] = [...uniqueRolesSet]
    const invitedUniqueUsers: string[] = [...invitedUniqueUsersSet]
    const invitedUserPromise = InvitationUserRole.find({ email: { $in: invitedUniqueUsers }, team: team._id })
    const rolesPromise = Role.find({ name: { $in: uniqueRoles } })
    const [invitedUser, roles] = await Promise.all([invitedUserPromise, rolesPromise])
    const mismatchInvitedUsers = invitedUser.length > 0
    const mismatchRoles = roles.length !== uniqueRoles.length
    if (mismatchRoles || mismatchInvitedUsers) {
      throw new IllegalArgumentError('Some of the users cannot be invited due to invalid email or roles')
    }
    const rolesMapper: Record<string, Role.Document> = keyBy(roles, 'name')
    const createInvitedUsers = inviteUsers.map(({ email, roles }) => ({
      email,
      rolesIds: roles.map((x) => rolesMapper[x]?._id),
      isInvitationAccepted: false,
      team: team._id
    }))
    await InvitationUserRole.insertMany(createInvitedUsers)
  }
}
