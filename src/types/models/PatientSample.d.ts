// TODO: Need to remove qcStatus once we enable SAMPLE_SEQUENCING_LIBRARY_ENABLED
declare namespace PatientSample {
  interface Attributes {
    sampleId: string
    patient: Mongoose.ObjectId | Patient.Document
    type: import('enums').PatientSampleTypes
    barcode: string
    igvFile: string
    date: Date
    owner: Mongoose.ObjectId
    i: string
    labPortalID: string
    referenceId: string
    qcStatus: import('enums').SampleQCStatus
    qcStatusUpdateAt: Date
    qcJobLink: string
    createdAt: Date
    updatedAt: Date
    registrationDate: Date
  }

  interface Document extends Attributes, Mongoose.Document {
    view(owner: User): View
  }

  interface Model extends Mongoose.Model<Document> {
    generateID({
      sampleType,
      patient,
      team
    }: {
      sampleType: string
      patient: Patient.Document
      team?: Team
    }): Promise<string>
    updateById(patientSampleId: string, updateData: { [key: string]: any }): Promise<Document>
  }

  interface View {
    _id: string
    sampleId: Attributes['sampleId']
    patient: string
    type: Attributes['type']
    barcode: Attributes['barcode']
    igvFile: Attributes['igvFile']
    i: Attributes['i']
    date: string
    owner: string | User
    labPortalID?: Attributes['labPortalID']
    referenceId?: Attributes['referenceId']
    qcStatus?: Attributes['qcStatus']
    qcStatusUpdateAt?: string
    qcJobLink?: Attributes['qcJobLink']
    createdAt: string
    updatedAt: string
    registrationDate?: string
  }
}
