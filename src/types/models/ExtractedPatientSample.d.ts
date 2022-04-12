declare namespace ExtractedPatientSample {
  interface Attributes {
    name: string;
    patient: Mongoose.ObjectId | Patient.Document;
    patientSample: Mongoose.ObjectId | PatientSample.Document;
    subClass: string;
    sampleAliquot: Mongoose.ObjectId | PatientSampleAliquot.Document;
    extractionKitType: string;
    extractionLocation: string;
    extractionMethod: string;
    labPortalID: string;
    createdAt: Date;
    updatedAt: Date;
  }

  interface Document extends Attributes, Mongoose.Document {}

  interface Model extends Mongoose.Model<Document> {}
}
