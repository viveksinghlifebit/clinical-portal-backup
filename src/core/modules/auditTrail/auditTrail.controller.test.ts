import mongoose from 'mongoose';
import { AuditLevel } from 'enums';
import { AuditTrail } from '@core/models';
import { AuditTrailService } from './auditTrail.controller';

describe('auditTrail', () => {
  const mockCreateAuditTrail = (): void => {
    AuditTrail.create = jest.fn().mockReturnValue({
      catch: jest.fn()
    });
  };

  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('log', () => {
    test('should create a audit trail log entry in the db with the information passed in it', async () => {
      const actionOwner = new mongoose.Types.ObjectId();
      const level = AuditLevel.Info;
      const message = 'test-message';
      const requestId = 'requestId';
      const metadata = {
        test: 'test-metaData'
      } as AuditTrail.ESInfoMetadata;
      mockCreateAuditTrail();
      await AuditTrailService.log(message, level, requestId, metadata, actionOwner);
      expect(AuditTrail.create).toHaveBeenCalled();
      expect(AuditTrail.create).toHaveBeenCalledWith({
        actionOwner,
        level,
        message,
        requestId,
        metadata
      });
    });
  });
});
