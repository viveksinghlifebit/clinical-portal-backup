import { AuditTrailSchema } from '@schemas/AuditTrail.schema'

export const auditTrailModelName = 'AuditTrail'

/**
 * MODEL METHODS
 */

function view(this: AuditTrail.Document): AuditTrail.View {
  return {
    _id: this._id.toHexString(),
    level: this.level,
    message: this.message,
    requestId: this.requestId,
    timestamp: this.timestamp,
    actionOwner: this.actionOwner.toHexString(),
    metadata: this.metadata
  }
}

AuditTrailSchema.methods = {
  view
}

/**
 * MODEL INITIALIZATION
 */

export let AuditTrail: AuditTrail.Model

export const init = (connection: Mongoose.Connection): void => {
  AuditTrail = connection.model<AuditTrail.Document, AuditTrail.Model>(auditTrailModelName, AuditTrailSchema)
}
