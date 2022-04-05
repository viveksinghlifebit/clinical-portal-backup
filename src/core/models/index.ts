import * as auditTrail from './AuditTrail'
import * as role from './Role'
import * as userRole from './UserRole'
import * as invitationUserRole from './InvitationUserRole'
import * as patientWorkgroup from './PatientWorkgroup'
import * as workgroup from './Workgroup'

export const init = (connections: Mongoose.Connections): void => {
  auditTrail.init(connections.clinicalPortalConnection)

  /**
   * Role based access control models
   */
  role.init(connections.clinicalPortalConnection)
  userRole.init(connections.clinicalPortalConnection)
  invitationUserRole.init(connections.clinicalPortalConnection)

  workgroup.init(connections.clinicalPortalConnection)
  patientWorkgroup.init(connections.clinicalPortalConnection)
}

export { AuditTrail } from './AuditTrail'
export { Role } from './Role'
export { UserRole } from './UserRole'
export { InvitationUserRole } from './InvitationUserRole'
export { PatientWorkgroup } from './PatientWorkgroup'
export { Workgroup } from './Workgroup'
