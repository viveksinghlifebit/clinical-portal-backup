import { log } from 'services/log';
import { AuditTrail } from '@core/models';

export class AuditTrailService {
  static async log(
    message: AuditTrail.Attributes['message'],
    level: AuditTrail.Attributes['level'],
    requestId: AuditTrail.Attributes['requestId'],
    metadata: AuditTrail.ESInfoMetadata,
    actionOwner: AuditTrail.Attributes['actionOwner']
  ): Promise<void> {
    await AuditTrail.create({ message, level, requestId, metadata, actionOwner }).catch(log.error);
  }
}
