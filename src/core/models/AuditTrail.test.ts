import { Types } from 'mongoose'
import { v4 } from 'uuid'
import { AuditLevel } from 'enums'
import { AuditTrail } from './AuditTrail'

describe('AuditTrail', () => {
  describe('view', () => {
    test('When called, then it should transform AuditTrail properly.', () => {
      const auditTrail = new AuditTrail({
        _id: new Types.ObjectId(),
        level: AuditLevel.Info,
        actionOwner: new Types.ObjectId(),
        message: 'test message',
        metadata: {
          body: 'test'
        },
        timestamp: new Date('2021-05-24').getTime(),
        requestId: v4(),
        createdAt: new Date('2021-05-24'),
        updatedAt: new Date('2021-05-26')
      })
      expect(auditTrail.view()).toEqual({
        _id: auditTrail._id.toHexString(),
        level: auditTrail.level,
        actionOwner: auditTrail.actionOwner.toHexString(),
        message: auditTrail.message,
        metadata: auditTrail.metadata,
        requestId: auditTrail.requestId,
        timestamp: auditTrail.timestamp
      })
    })
  })
})
