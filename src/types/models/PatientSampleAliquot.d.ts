declare namespace PatientSampleAliquot {
  interface Attributes {
    patient: Mongoose.ObjectId | Patient.Document;
    labPortalID: string;
    createdAt: Date;
    updatedAt: Date;
    patientSample: Mongoose.ObjectId | PatientSample.Document;
    name: string;
  }

  interface Document extends Attributes, Mongoose.Document {}

  interface Model extends Mongoose.Model<Document> {}
}
