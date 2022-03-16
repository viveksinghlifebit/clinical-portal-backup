import { SchemaTypeOptions, Types, Schema } from 'mongoose'
import { AuditLevel } from 'enums'

const auditTrailSchema: Partial<Record<keyof AuditTrail.Attributes, SchemaTypeOptions<unknown>>> = {
  level: {
    type: String,
    required: true,
    enum: Object.values(AuditLevel),
    immutable: true
  },
  requestId: {
    type: String,
    required: true,
    immutable: true,
    index: true
  },
  message: {
    type: String,
    required: true,
    immutable: true
  },
  timestamp: {
    type: Number,
    required: true,
    default: () => Date.now(),
    immutable: true,
    index: true
  },
  metadata: {
    type: Object,
    immutable: true
  },
  actionOwner: {
    type: Types.ObjectId,
    immutable: true,
    index: true
  }
}

const AuditTrailSchema = new Schema(auditTrailSchema, { timestamps: true })

export { AuditTrailSchema }
