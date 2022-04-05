declare namespace PatientPhenotype {
  interface Attributes {
    patient: Mongoose.ObjectId
    fieldId: number
    instance: string
    array: number
    value: string
    createdAt: Date
    updatedAt: Date
  }

  interface Document extends Attributes, Mongoose.Document {
    view(): View
  }

  type Model = Mongoose.Model<Document>

  interface View {
    fieldId: Attributes['fieldId']
    instance: Attributes['instance']
    array: Attributes['array']
    value: Attributes['value']
    createdAt: string
    updatedAt: string
  }
}
