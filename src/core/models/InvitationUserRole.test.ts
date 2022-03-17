import { Types } from 'mongoose'
import { InvitationUserRole } from './InvitationUserRole'
describe('InvitationUserRole', () => {
  describe('view', () => {
    test('When called, then it should transform InvitationUserRole properly.', () => {
      const invitationUserRole = new InvitationUserRole({
        _id: new Types.ObjectId(),
        email: 'test',
        team: new Types.ObjectId(),
        rolesIds: [new Types.ObjectId()],
        isInvitationAccepted: true,
        createdAt: new Date('2021-05-24'),
        updatedAt: new Date('2021-05-26')
      })
      expect(invitationUserRole.view()).toEqual({
        _id: invitationUserRole._id.toHexString(),
        email: invitationUserRole.email,
        team: invitationUserRole.team.toHexString(),
        isInvitationAccepted: invitationUserRole.isInvitationAccepted,
        roles: (invitationUserRole.rolesIds as Mongoose.ObjectId[]).map(String)
      })
    })
  })
})
