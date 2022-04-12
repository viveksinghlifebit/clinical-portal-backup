declare namespace GenoMarker {
  interface Attributes {
    _id?: Mongoose.ObjectId;
    index: number;
    id: number;
    cn: string;
    fullLocation: string;
    gene: string;
  }
}
