import mongoose from 'mongoose'
import { RolesRoutes } from 'enums'
import { Role } from './Role'

describe('Role', () => {
  const permission1: Role.RoleBaseAccessPermission = {
    name: RolesRoutes.CohortDataExport,
    access: {
      create: true,
      delete: false,
      read: false,
      update: true
    }
  }
  const permission2: Role.RoleBaseAccessPermission = {
    name: RolesRoutes.CohortFields,
    access: {
      create: true,
      delete: true,
      read: false,
      update: true
    }
  }
  const permissions: Role.RoleBaseAccessPermission[] = [permission1, permission2]

  let mockRole: jest.SpyInstance
  beforeAll(() => {
    mockRole = jest.spyOn(Role, 'find')
  })

  afterAll(jest.restoreAllMocks)
  describe('view', () => {
    test('When called, then it should transform Role properly.', () => {
      const role = new Role({
        _id: new mongoose.Types.ObjectId(),
        name: 'test',
        diplayName: 'test',
        permissions,
        createdAt: new Date('2021-05-24'),
        updatedAt: new Date('2021-05-26')
      })
      expect(role.view()).toEqual({
        name: role.name,
        permissions: role.permissions.map(({ name, access }) => ({ name, access })),
        displayName: role.displayName
      })
    })
  })

  describe('findRolesByRoleIds', () => {
    test('should return all the matching roles', async () => {
      const role = new Role({
        _id: new mongoose.Types.ObjectId(),
        name: 'test',
        diplayName: 'test',
        permissions,
        createdAt: new Date('2021-05-24'),
        updatedAt: new Date('2021-05-26')
      })
      mockRole.mockResolvedValue([role])
      const result = await Role.findRolesByRoleIds([new mongoose.Types.ObjectId().toHexString()])
      expect(result).toMatchObject([
        {
          name: role.name,
          permissions: role.permissions.map(({ name, access }) => ({ name, access })),
          displayName: role.displayName
        }
      ])
    })
  })
})
