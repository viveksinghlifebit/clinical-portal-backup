declare namespace Workgroup {
  interface Attributes {
    name: string;
    numberOfPatients: number;
    team: Mongoose.ObjectId;
    owner: Mongoose.ObjectId | User;
    createdAt?: Date;
    updatedAt?: Date;
  }

  interface Document extends Attributes, Mongoose.Document {
    view(): View;
  }

  interface Model extends Mongoose.Model<Document> {
    //
    findWorkgroups(
      conditions: Record<string, unknown>,
      { perPage, page }: Mongoose.PagingSpecs,
      { sorting }: Mongoose.SortingSpecs
    ): Promise<Workgroup.Document[]>;
    countWorkgroups(conditions: Record<string, unknown>): Promise<number>;
    findByNameAndTeam(name: string, teamId: string): Promise<Workgroup.Document | null>;
    findByTermAndTeam(term: string, teamId: string): Promise<Array<Workgroup.Document>>;
    findByIdAndTeam(id: string, teamId: string): Promise<Workgroup.Document | null>;
    deleteWorkgroups(query: Record<string, unknown>): Promise<void>;
    saveWorkgroup(workgroup: Workgroup.Attributes): Promise<Workgroup.Document>;
  }

  interface View {
    _id: string;
    name: string;
    numberOfPatients: number;
    team: string;
    owner: string | User;
  }

  interface SearchData extends App.PaginationInfoResponse {
    workgroups: Workgroup.View[];
  }
}
