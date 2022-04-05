declare namespace PatientFamilyMemberData {
  interface Attributes {
    patientFamilyMember: string | PatientFamilyMember.Attributes
    display_name: string
    affected: number
  }

  interface Document extends Attributes, Mongoose.Document {
    // ...
  }

  interface Model extends Mongoose.Model<Document> {}
}
