export class PhenotypeNestedListResponseBuilder {
  private readonly field: Partial<Filter.PhenotypeNestedListResponse>;

  constructor() {
    this.field = {};
  }

  public withCoding(coding: string): PhenotypeNestedListResponseBuilder {
    this.field.coding = coding;
    return this;
  }

  public withNodeId(nodeId: string): PhenotypeNestedListResponseBuilder {
    this.field.nodeId = nodeId;
    return this;
  }

  public withChildren(children: Filter.PhenotypeNestedListResponse[]): PhenotypeNestedListResponseBuilder {
    this.field.children = children;
    return this;
  }

  public withCount(count: number): PhenotypeNestedListResponseBuilder {
    this.field.count = count;
    return this;
  }

  public build(): Filter.PhenotypeNestedListResponse {
    return this.field as Filter.PhenotypeNestedListResponse;
  }
}
