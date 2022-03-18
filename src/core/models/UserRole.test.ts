import mongoose from 'mongoose'
import { UserRole } from './UserRole'
describe('UserRole', () => {
  const getUserRole = (): UserRole.Document => {
    return new UserRole({
      _id: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      team: new mongoose.Types.ObjectId(),
      rolesIds: [new mongoose.Types.ObjectId()],
      createdAt: new Date('2021-05-24'),
      updatedAt: new Date('2021-05-26')
    })
  }
  describe('view', () => {
    test('When called, then it should transform UserRole properly.', () => {
      const userRole = getUserRole()
      expect(userRole.view()).toEqual({
        _id: userRole._id.toHexString(),
        userId: userRole.userId.toHexString(),
        team: userRole.team.toHexString(),
        roles: (userRole.rolesIds as Mongoose.ObjectId[]).map(String)
      })
    })
  })

  describe('findByUserAndTeamId', () => {
    let mockFindOne: jest.SpyInstance

    beforeAll(() => {
      mockFindOne = jest.spyOn(UserRole, 'findOne')
    })

    afterAll(jest.restoreAllMocks)

    test('should return null if no userRole is present', async () => {
      mockFindOne.mockResolvedValue(null)

      const result = await UserRole.findByUserAndTeamId(new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId())

      expect(result).toBeNull()
    })

    test('should return view of the userRole if userRole is present', async () => {
      const userRole = getUserRole()
      mockFindOne.mockResolvedValue(userRole)

      const result = await UserRole.findByUserAndTeamId(userRole.userId, userRole.team)

      expect(result).toMatchObject({
        _id: userRole._id.toHexString(),
        userId: userRole.userId.toHexString(),
        team: userRole.team.toHexString(),
        roles: (userRole.rolesIds as Mongoose.ObjectId[]).map(String)
      })
    })
  })
})
