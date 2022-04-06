import { ClinicalRole } from '@core/enums'
import { PatientWorkgroupSchema } from '@schemas'

const patientModelName = 'PatientWorkgroup'

async function countByWorkgroupAndPatient(
  workgroupId: PatientWorkgroup.Attributes['workgroup'],
  patient: PatientWorkgroup.Attributes['patient']
): Promise<number> {
  return PatientWorkgroup.count({ workgroup: workgroupId, patient })
}

async function countByWorkgroup(workgroupId: PatientWorkgroup.Attributes['workgroup']): Promise<number> {
  return PatientWorkgroup.count({ workgroup: workgroupId })
}

/**
 * Returns grouped patients with workgroupId
 * @param workgroupIds string[]
 * @param user User
 * @returns
 */
async function getRefererredPatientsCountWithWorkGroup(
  workgroupIds: string[],
  user: User
): Promise<{ workgroup: string; patients: number }[]> {
  const roles = []
  if (user.rbacRoles?.some(({ name }) => name === ClinicalRole.FieldSpecialist)) {
    roles.push(ClinicalRole.FieldSpecialist)
  }
  if (user.rbacRoles?.some(({ name }) => name === ClinicalRole.ReferringClinician)) {
    roles.push(ClinicalRole.ReferringClinician)
  }
  return PatientWorkgroup.aggregate([
    {
      $match: {
        workgroup: { $in: workgroupIds }
      }
    },
    {
      $lookup: {
        from: 'patients',
        let: {
          patientId: '$patient'
        },
        pipeline: [
          {
            $match: {
              $and: [
                {
                  referringUsers: {
                    $elemMatch: {
                      name: String(user._id),
                      type: {
                        $in: roles
                      }
                    }
                  }
                },
                {
                  $expr: {
                    $eq: ['$_id', '$$patientId']
                  }
                }
              ]
            }
          }
        ],
        as: 'patients'
      }
    },
    {
      $project: {
        _id: 0,
        workgroup: 1,
        patients: { $size: '$patients' }
      }
    },
    {
      $group: {
        _id: '$workgroup',
        patients: { $sum: '$patients' }
      }
    }
  ])
}

PatientWorkgroupSchema.statics = {
  countByWorkgroupAndPatient,
  countByWorkgroup,
  getRefererredPatientsCountWithWorkGroup
}

function view(this: PatientWorkgroup.Document): PatientWorkgroup.View {
  return {
    _id: this._id.toHexString(),
    markers: this.markers,
    comparisonFilters: this.comparisonFilters,
    workgroup: this.workgroup,
    description: this.description,
    markersDefinition: this.markersDefinition,
    igvFiles: this.igvFiles,
    associatedDiseasesWithTieredVariants: this.associatedDiseasesWithTieredVariants,
    diseaseGene: this.diseaseGene,
    tierSNV: this.tierSNV,
    patient: this.patient,
    fields: this.fields,
    createdAt: this.createdAt.toISOString(),
    updatedAt: this.updatedAt.toISOString()
  }
}

PatientWorkgroupSchema.methods = {
  view
}

export let PatientWorkgroup: PatientWorkgroup.Model

export const init = (connection: Mongoose.Connection): void => {
  PatientWorkgroup = connection.model<PatientWorkgroup.Document, PatientWorkgroup.Model>(
    patientModelName,
    PatientWorkgroupSchema
  )
}
