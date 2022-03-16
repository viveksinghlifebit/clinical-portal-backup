import * as auditTrail from './AuditTrail'

export const init = (connections: Mongoose.Connections): void => {
  auditTrail.init(connections.masterConnection)
}

export { AuditTrail } from './AuditTrail'
