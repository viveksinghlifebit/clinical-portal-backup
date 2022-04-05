declare namespace PatientWorkgroup {
  interface Attributes {
    _id: Mongoose.ObjectId
    markers: Array<CorePatient.PatientMarker>
    comparisonFilters: Array<CorePatient.FilterId | unknown>
    workgroup: string | Workgroup.Attributes
    description: string
    markersDefinition: Array<GenoMarker.Attributes>
    igvFiles: Array<string>
    associatedDiseasesWithTieredVariants: Array<CorePatient.TierDataDiseases>
    diseaseGene: Record<string, string>
    tierSNV: CorePatient.TierData
    patient: string | Patient.Attributes | Patient.View
    fields: Array<CorePatient.PatientWorkgroupField>
    createdAt: Date
    updatedAt: Date
  }

  interface Document extends Attributes {
    view(): View
  }

  interface Model extends Mongoose.Model<Document> {
    countByWorkgroupAndPatient(workgroupId: Mongoose.ObjectId, patient: Mongoose.ObjectId): Promise<number>

    countByWorkgroup(workgroupId: Mongoose.ObjectId): Promise<number>
  }

  interface View {
    _id: string
    markers: Attributes['markers']
    comparisonFilters: Attributes['comparisonFilters']
    workgroup: Attributes['workgroup']
    description: Attributes['description']
    markersDefinition: Attributes['markersDefinition']
    igvFiles: Attributes['igvFiles']
    associatedDiseasesWithTieredVariants: Attributes['associatedDiseasesWithTieredVariants']
    diseaseGene: Attributes['diseaseGene']
    tierSNV: Attributes['tierSNV']
    patient: Attributes['patient']
    fields: Attributes['fields']
    createdAt: string
    updatedAt: string
  }
}
