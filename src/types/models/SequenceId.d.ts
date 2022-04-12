declare namespace SequenceId {
  interface Attributes {
    _id: Mongoose.ObjectId;
    name: string;
    prefix: string;
    value: number;
  }

  interface Document extends Attributes {
    toPadString(size?: number): string;
  }

  interface Model extends Mongoose.Model<Document> {
    getNextByName(name: SequenceId.SequenceIdNames): Promise<SequenceId.Document>;
    getOrCreateNextByName(this: SequenceId.Model, name: Patient.Attributes['i']): Promise<SequenceId.Document>;
  }

  type SequenceIdNames = import('enums').SequenceIdNames;
}
