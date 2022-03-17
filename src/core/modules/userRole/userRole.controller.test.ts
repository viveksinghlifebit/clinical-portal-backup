import { IllegalArgumentError, InvalidStateError, ResourceNotFoundError } from '../../../errors'
import mongoose from 'mongoose'
import { TeamBuilder, UserBuilder, getMockedMongoQueryInstance } from 'testUtils'
import { UserRepository } from '@core/repos'
import { RolesRoutes } from 'enums'
import { InvitationUserRole, Role, UserRole } from '@core/models'

import { UserRoleService } from './userRole.controller'

describe('UserRole', () => {
  describe('createBaseUserRole', () => {
    const mockUserRepositoryFindById = (value: unknown): void => {
      UserRepository.findById = jest.fn().mockResolvedValue(value)
    }
    const mockInvitationUserRole = (value: unknown): void => {
      InvitationUserRole.findOne = jest.fn().mockResolvedValue(value)
    }
    const mockUserRoleFindOne = (value: unknown): void => {
      UserRole.findOne = jest.fn().mockResolvedValue(value)
    }
    const mockRoleFindOne = (value: unknown): void => {
      Role.findOne = jest.fn().mockResolvedValue(value)
    }
    const mockCreateUserRole = (): void => {
      UserRole.create = jest.fn()
    }
    const mockAggregationUserRole = (value: unknown): void => {
      UserRole.aggregate = jest.fn().mockResolvedValue([value])
    }
    afterEach(jest.restoreAllMocks)
    test('should return user roles', async () => {
      const userRole = new UserRole()
      const role = new Role()
      role.name = 'Admin'
      role.displayName = 'Admin'
      role.permissions = [
        {
          name: RolesRoutes.Cohort,
          access: {
            create: true,
            delete: true,
            read: true,
            update: true
          }
        }
      ]
      userRole.userId = new mongoose.Types.ObjectId()
      userRole.team = new mongoose.Types.ObjectId()
      mockUserRoleFindOne(userRole)
      const aggregationMockResult = {
        _id: (userRole._id as mongoose.Types.ObjectId).toHexString(),
        roles: [
          {
            _id: role._id.toHexString(),
            name: role.name,
            displayName: role.displayName
          }
        ],
        userId: userRole.userId.toHexString(),
        team: userRole.team.toHexString()
      }
      mockAggregationUserRole(aggregationMockResult)
      const userWithRoles = await UserRoleService.getMyUserRole({
        user: ({ _id: new mongoose.Types.ObjectId() } as unknown) as User,
        team: ({ _id: new mongoose.Types.ObjectId() } as unknown) as Team
      })
      expect(userWithRoles).toMatchObject(aggregationMockResult)
    })

    test(`should create userRole if userRole is not present`, async () => {
      mockUserRepositoryFindById(null)
      await expect(
        UserRoleService.createBaseUserRole({
          user: ({ _id: new mongoose.Types.ObjectId() } as unknown) as User,
          team: ({ _id: new mongoose.Types.ObjectId() } as unknown) as Team
        })
      ).rejects.toThrowError(new InvalidStateError('User is invalid'))
    })

    test(`should create userRole if invitationUserRole is present`, async () => {
      mockUserRepositoryFindById({ email: 'test' })
      mockUserRoleFindOne(null)
      mockCreateUserRole()
      const userRole = new UserRole()
      const role = new Role()
      role.name = 'Admin'
      role.displayName = 'Admin'
      role.permissions = [
        {
          name: RolesRoutes.Cohort,
          access: {
            create: true,
            delete: true,
            read: true,
            update: true
          }
        }
      ]
      mockInvitationUserRole({ rolesIds: [role] })
      userRole.userId = new mongoose.Types.ObjectId()
      userRole.team = new mongoose.Types.ObjectId()
      mockUserRoleFindOne(null)
      const aggregationMockResult = {
        _id: (userRole._id as mongoose.Types.ObjectId).toHexString(),
        roles: [
          {
            _id: role._id.toHexString(),
            name: role.name,
            displayName: role.displayName
          }
        ],
        userId: userRole.userId.toHexString(),
        team: userRole.team.toHexString()
      }
      mockAggregationUserRole(aggregationMockResult)
      const userWithRoles = await UserRoleService.createBaseUserRole({
        user: ({ _id: new mongoose.Types.ObjectId() } as unknown) as User,
        team: ({ _id: new mongoose.Types.ObjectId() } as unknown) as Team
      })
      expect(userWithRoles).toMatchObject(aggregationMockResult)
      expect(UserRepository.findById).toHaveBeenCalledTimes(1)
      expect(InvitationUserRole.findOne).toHaveBeenCalledTimes(1)
    })

    test(`should create userRole if userRole is not present`, async () => {
      mockUserRepositoryFindById({ email: 'test' })
      mockInvitationUserRole(null)
      mockUserRoleFindOne(null)
      mockCreateUserRole()
      const userRole = new UserRole()
      const role = new Role()
      role.name = 'Admin'
      role.displayName = 'Admin'
      role.permissions = [
        {
          name: RolesRoutes.Cohort,
          access: {
            create: true,
            delete: true,
            read: true,
            update: true
          }
        }
      ]
      mockRoleFindOne(role)
      userRole.userId = new mongoose.Types.ObjectId()
      userRole.team = new mongoose.Types.ObjectId()
      mockUserRoleFindOne(userRole)
      const aggregationMockResult = {
        _id: (userRole._id as mongoose.Types.ObjectId).toHexString(),
        roles: [
          {
            _id: role._id.toHexString(),
            name: role.name,
            displayName: role.displayName
          }
        ],
        userId: userRole.userId.toHexString(),
        team: userRole.team.toHexString()
      }
      mockAggregationUserRole(aggregationMockResult)
      const userWithRoles = await UserRoleService.createBaseUserRole({
        user: ({ _id: new mongoose.Types.ObjectId() } as unknown) as User,
        team: ({ _id: new mongoose.Types.ObjectId() } as unknown) as Team
      })
      expect(userWithRoles).toMatchObject(aggregationMockResult)
    })

    test(`should return empty object if userRole is created but without any role`, async () => {
      const userRole = new UserRole()
      mockUserRoleFindOne(userRole)
      mockAggregationUserRole(null)
      await expect(
        UserRoleService.getMyUserRole({
          user: ({ _id: new mongoose.Types.ObjectId() } as unknown) as User,
          team: ({ _id: new mongoose.Types.ObjectId() } as unknown) as Team
        })
      ).rejects.toThrowError(new ResourceNotFoundError(`User role doesn't exists`))
    })
  })
  describe('getRoles', () => {
    const mockAggregationUserRole = (value: unknown): void => {
      UserRole.aggregate = jest.fn().mockResolvedValue([value])
    }
    test('should return user roles', async () => {
      const userRole = new UserRole()
      const role = new Role()
      role.name = 'Admin'
      role.displayName = 'Admin'
      role.permissions = [
        {
          name: RolesRoutes.Cohort,
          access: {
            create: true,
            delete: true,
            read: true,
            update: true
          }
        }
      ]
      userRole.userId = new mongoose.Types.ObjectId()
      userRole.team = new mongoose.Types.ObjectId()
      const aggregationMockResult = {
        _id: (userRole._id as mongoose.Types.ObjectId).toHexString(),
        roles: [
          {
            _id: role._id.toHexString(),
            name: role.name,
            displayName: role.displayName
          }
        ],
        userId: userRole.userId.toHexString(),
        team: userRole.team.toHexString()
      }
      mockAggregationUserRole(aggregationMockResult)
      const userWithRoles = await UserRoleService.getMyUserRole({
        user: ({ _id: new mongoose.Types.ObjectId() } as unknown) as User,
        team: ({ _id: new mongoose.Types.ObjectId() } as unknown) as Team
      })
      expect(userWithRoles).toMatchObject(aggregationMockResult)
    })

    test(`should return empty object if aggregation doesn't match with userId`, async () => {
      mockAggregationUserRole(null)
      await expect(
        UserRoleService.getMyUserRole({
          user: ({ _id: new mongoose.Types.ObjectId() } as unknown) as User,
          team: ({ _id: new mongoose.Types.ObjectId() } as unknown) as Team
        })
      ).rejects.toThrowError(new ResourceNotFoundError(`User role doesn't exists`))
    })
  })

  describe('listUserRolesPaginated', () => {
    const mockUserRole = (value: unknown): void => {
      UserRole.find = jest.fn().mockReturnValue({
        populate: () => ({
          sort: () => [value]
        })
      })
    }
    const mockInvitationUserRole = (value: unknown): void => {
      InvitationUserRole.find = jest.fn().mockReturnValue({
        populate: () => ({
          sort: () => [value]
        })
      })
    }
    const mockUserRepository = (value: unknown): void => {
      UserRepository.find = jest.fn().mockResolvedValue(value)
    }
    afterEach(jest.clearAllMocks)

    test('When called, then it should call the proper methods.', async () => {
      const mongoQuery = getMockedMongoQueryInstance()
      const user: User = new UserBuilder().withId(new mongoose.Types.ObjectId()).withName('user').build()

      const team = new TeamBuilder().withId(new mongoose.Types.ObjectId()).withName('team').build()

      const userId = new mongoose.Types.ObjectId()
      mockUserRole({
        userId: userId,
        rolesIds: [
          {
            name: 'test-role-name',
            displayName: 'test-role-displayName'
          }
        ]
      })
      mockInvitationUserRole({
        email: 'test@test.com',
        rolesIds: [
          {
            name: 'invitation-user-role-name',
            displayName: 'invitation-user-role-displayName'
          }
        ]
      })
      mockUserRepository([{ _id: userId, name: 'test', surname: 'test-surname' }])
      const result = await UserRoleService.listUserRolesPaginated({ user, team })
      expect(mongoQuery.withTeamOrOwner).toHaveBeenCalledWith(user, team)
      expect(mongoQuery.compile).toHaveBeenCalled()
      expect(UserRole.find).toHaveBeenCalled()
      expect(UserRepository.find).toHaveBeenCalledWith({ _id: { $in: [userId] } })
      expect(result.data).toMatchObject([
        {
          id: userId,
          name: 'test',
          roles: [
            {
              displayName: 'test-role-displayName',
              name: 'test-role-name'
            }
          ],
          surname: 'test-surname',
          teamName: 'team'
        },
        {
          email: 'test@test.com',
          name: 'Member',
          roles: [
            {
              name: 'invitation-user-role-name',
              displayName: 'invitation-user-role-displayName'
            }
          ],
          teamName: 'team'
        }
      ])
    })
  })

  describe('updateUserRole', () => {
    const mockUserRole = (value: unknown): void => {
      UserRole.findOneAndUpdate = jest.fn().mockReturnValue(value)
    }
    const mockInvitationUserRole = (value: unknown): void => {
      InvitationUserRole.findOneAndUpdate = jest.fn().mockReturnValue(value)
    }
    const mockRole = (value: unknown): void => {
      Role.find = jest.fn().mockReturnValue(value)
    }
    const mockUserRepository = (value: unknown): void => {
      UserRepository.findOne = jest.fn().mockResolvedValue(value)
    }
    afterEach(jest.clearAllMocks)

    test('When called, then it should call the proper methods when userId is used.', async () => {
      const team = new TeamBuilder().withId(new mongoose.Types.ObjectId()).withName('team').build()
      const userId = new mongoose.Types.ObjectId()
      mockUserRole({
        userId: userId,
        rolesIds: [
          {
            name: 'test-role-name',
            displayName: 'test-role-displayName'
          }
        ]
      })
      mockUserRepository({ _id: userId, name: 'test', surname: 'test-surname' })
      const roleIds = [
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'test-role-name',
          displayName: 'test-role-displayName'
        }
      ]
      mockRole(roleIds)
      const result = await UserRoleService.updateUserRole({
        userId: userId.toHexString(),
        roles: ['test-role-name'],
        team
      })
      expect(Role.find).toHaveBeenCalled()
      expect(UserRole.findOneAndUpdate).toHaveBeenCalled()
      expect(UserRole.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: userId.toHexString(), team: team._id },
        { $set: { rolesIds: roleIds } }
      )
      expect(UserRepository.findOne).toHaveBeenCalledWith({ _id: userId.toHexString() })
      expect(result).toMatchObject({
        id: userId,
        name: 'test',
        roles: [
          {
            displayName: 'test-role-displayName',
            name: 'test-role-name'
          }
        ],
        surname: 'test-surname',
        teamName: 'team'
      })
    })

    test('When called, then it should call the proper methods when email is used.', async () => {
      const team = new TeamBuilder().withId(new mongoose.Types.ObjectId()).withName('team').build()
      const email = 'test@test.com'
      mockUserRole({
        userId: email,
        rolesIds: [
          {
            name: 'test-role-name',
            displayName: 'test-role-displayName'
          }
        ]
      })
      const roleIds = [
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'test-role-name',
          displayName: 'test-role-displayName'
        }
      ]
      mockInvitationUserRole({ email, isInvitationAccepted: false, roleIds })
      mockRole(roleIds)
      const result = await UserRoleService.updateUserRole({ email, roles: ['test-role-name'], team })
      expect(Role.find).toHaveBeenCalled()
      expect(InvitationUserRole.findOneAndUpdate).toHaveBeenCalled()
      expect(InvitationUserRole.findOneAndUpdate).toHaveBeenCalledWith(
        { email, team: team._id, isInvitationAccepted: false },
        { $set: { rolesIds: roleIds } }
      )
      expect(result).toMatchObject({
        name: 'Member',
        roles: [
          {
            displayName: 'test-role-displayName',
            name: 'test-role-name'
          }
        ],
        teamName: 'team'
      })
    })
  })

  describe('createUserRole', () => {
    const mockUserRole = (value: unknown): void => {
      UserRole.create = jest.fn().mockReturnValue(value)
    }
    const mockRole = (value: unknown): void => {
      Role.find = jest.fn().mockReturnValue(value)
    }
    const mockUserRepository = (value: unknown): void => {
      UserRepository.findOne = jest.fn().mockResolvedValue(value)
    }
    afterEach(jest.clearAllMocks)

    test('When called, then it should call the proper methods.', async () => {
      const team = new TeamBuilder().withId(new mongoose.Types.ObjectId()).withName('team').build()
      const userId = new mongoose.Types.ObjectId()
      mockUserRole({
        userId: userId,
        rolesIds: [
          {
            name: 'test-role-name',
            displayName: 'test-role-displayName'
          }
        ]
      })
      mockUserRepository({ _id: userId, name: 'test', surname: 'test-surname' })
      const roleId = new mongoose.Types.ObjectId()
      const roleIds = [{ _id: roleId, name: 'Admin', displayName: 'Admin' }]
      mockRole(roleIds)
      const result = await UserRoleService.createUserRole({ userId: userId.toHexString(), roles: ['Admin'], team })
      expect(Role.find).toHaveBeenCalled()
      expect(UserRole.create).toHaveBeenCalled()
      expect(UserRole.create).toHaveBeenCalledWith({ userId: userId.toHexString(), team: team._id, rolesIds: [roleId] })
      expect(UserRepository.findOne).toHaveBeenCalledWith({ _id: userId.toHexString() })
      expect(result).toMatchObject({
        id: userId,
        name: 'test',
        roles: [
          {
            displayName: 'Admin',
            name: 'Admin'
          }
        ],
        surname: 'test-surname',
        teamName: 'team'
      })
    })
  })

  describe('deleteUserRole', () => {
    const mockUserRole = (): void => {
      UserRole.deleteOne = jest.fn()
    }

    afterEach(jest.clearAllMocks)

    test('When called, then it should call the proper methods.', async () => {
      const team = new TeamBuilder().withId(new mongoose.Types.ObjectId()).withName('team').build()
      const userId = new mongoose.Types.ObjectId().toHexString()
      mockUserRole()
      await UserRoleService.deleteUserRole({ userId: userId, team })
      expect(UserRole.deleteOne).toHaveBeenCalled()
      expect(UserRole.deleteOne).toHaveBeenCalledWith({ userId, team })
    })
  })

  describe('invite', () => {
    const mockInvitationUserRoleFind = (value: unknown): void => {
      InvitationUserRole.find = jest.fn().mockReturnValue(Promise.resolve(value))
    }

    const mockRoleFind = (value: unknown): void => {
      Role.find = jest.fn().mockReturnValue(Promise.resolve(value))
    }

    const mockInvitationUserRoleInsertMany = (): void => {
      InvitationUserRole.insertMany = jest.fn()
    }

    afterEach(jest.clearAllMocks)

    test('When called with roles which are not present in DB, then it should throw error.', async () => {
      const team = new TeamBuilder().withId(new mongoose.Types.ObjectId()).withName('team').build()
      const params = [{ email: 'test', roles: ['Nurse', 'test'] }]
      mockRoleFind([{ name: 'Nurse', _id: new mongoose.Types.ObjectId() }])
      mockInvitationUserRoleFind([])
      await expect(UserRoleService.invite(params, team)).rejects.toThrowError(
        new IllegalArgumentError('Some of the users cannot be invited due to invalid email or roles')
      )
    })

    test('When called with email which are present in DB, then it should throw error.', async () => {
      const team = new TeamBuilder().withId(new mongoose.Types.ObjectId()).withName('team').build()
      const params = [{ email: 'test', roles: ['Nurse'] }]
      mockRoleFind([{ name: 'Nurse', _id: new mongoose.Types.ObjectId() }])
      mockInvitationUserRoleFind([{ email: 'test' }])
      await expect(UserRoleService.invite(params, team)).rejects.toThrowError(
        new IllegalArgumentError('Some of the users cannot be invited due to invalid email or roles')
      )
    })

    test(`When called with email which doesn't exists in DB and correct roles, then it should call the proper methods.`, async () => {
      const team = new TeamBuilder().withId(new mongoose.Types.ObjectId()).withName('team').build()
      const params = [{ email: 'test', roles: ['Nurse'] }]
      mockRoleFind([{ name: 'Nurse', _id: new mongoose.Types.ObjectId() }])
      mockInvitationUserRoleFind([])
      mockInvitationUserRoleInsertMany()
      await UserRoleService.invite(params, team)
      expect(InvitationUserRole.insertMany).toHaveBeenCalled()
      expect(InvitationUserRole.insertMany).toHaveBeenCalledTimes(1)
      expect(InvitationUserRole.insertMany).toHaveBeenLastCalledWith([
        {
          email: 'test',
          rolesIds: [expect.any(mongoose.Types.ObjectId)],
          isInvitationAccepted: false,
          team: team._id
        }
      ])
    })
  })
})
