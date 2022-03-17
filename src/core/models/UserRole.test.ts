import mongoose from 'mongoose'
import { UserRole } from './UserRole'
describe('UserRole', () => {
  describe('view', () => {
    test('When called, then it should transform UserRole properly.', () => {
      const userRole = new UserRole({
        _id: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(),
        team: new mongoose.Types.ObjectId(),
        rolesIds: [new mongoose.Types.ObjectId()],
        createdAt: new Date('2021-05-24'),
        updatedAt: new Date('2021-05-26')
      })
      expect(userRole.view()).toEqual({
        _id: userRole._id.toHexString(),
        userId: userRole.userId.toHexString(),
        team: userRole.team.toHexString(),
        roles: (userRole.rolesIds as Mongoose.ObjectId[]).map(String)
      })
    })
  })
})
