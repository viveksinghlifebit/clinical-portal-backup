declare namespace PatientFamilyMember {
  interface Attributes {
    patient: Patient.Attributes['i'] | Patient.Attributes | Patient.View;
    relatives: {
      is: unknown;
      of: Patient.Attributes['i'] | Patient.Attributes | Patient.View;
    }[];
    family: PatientFamilyMember.Attributes[];
  }

  interface Document extends Attributes, Mongoose.Document {
    // ...
  }

  interface Model extends Mongoose.Model<Document> {
    generateID(): Promise<string>;
  }
}
