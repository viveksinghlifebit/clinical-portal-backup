declare namespace MedicalValueRepository {
  interface Attributes {
    _id: Mongoose.ObjectId;
    f: Filter.FilterId;
    v: string;
  }
}
