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

PatientWorkgroupSchema.statics = {
  countByWorkgroupAndPatient,
  countByWorkgroup
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
