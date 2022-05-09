declare namespace PhenotypeNestedList {
  interface Attributes {
    _id: Mongoose.ObjectId;
    coding: string;
    meaning: string;
    nodeId: string;
    parentId: string;
    selectable: boolean;
    count: number;
    total: number;
    children: PhenotypeNestedList.Attributes[];
  }
}
