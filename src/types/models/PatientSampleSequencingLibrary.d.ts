declare namespace PatientSampleSequencingLibrary {
  interface Attributes {
    sample: Mongoose.ObjectId
    patient: Mongoose.ObjectId
    sequencingId: string
    libraryNumber: string
    owner: Mongoose.ObjectId
    i: string
    date: Date
    igvFile: string
    operator: string
    labPortalID: string
    qcStatus: import('enums').SampleQCStatus
    qcStatusUpdateAt: Date
    qcJobLink: string
    createdAt: Date
    updatedAt: Date
  }

  interface Document extends Attributes, Mongoose.Document {
    view(owner: User): View
  }

  interface Model extends Mongoose.Model<Document> {}
  interface View {
    _id: string
    sample: string | PatientSample.View | Partial<PatientSample.View>
    sampleId: string
    patient: string
    sequencingId: string
    libraryNumber: Attributes['libraryNumber']
    date: string
    operator: string
    owner: string | User
    qcStatus?: Attributes['qcStatus']
    qcStatusUpdateAt?: Attributes['qcStatusUpdateAt']
    qcJobLink?: Attributes['qcJobLink']
    i: Attributes['i']
    createdAt: string
    updatedAt: string
    labPortalID: string
    igvFile: Attributes['igvFile']
  }
}
