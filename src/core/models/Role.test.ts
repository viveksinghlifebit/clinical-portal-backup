import mongoose from 'mongoose'
import { RolesRoutes } from 'enums'
import { Role } from './Role'
describe('Role', () => {
  describe('view', () => {
    test('When called, then it should transform Role properly.', () => {
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
})
