export class PhenotypeValueBuilder {
  private readonly field: Partial<PhenotypeValue.Attributes>;

  constructor() {
    this.field = {};
  }

  public withEid(eid: string): PhenotypeValueBuilder {
    this.field.i = eid;
    return this;
  }

  public withInstance(instance: string): PhenotypeValueBuilder {
    this.field.i = instance;
    return this;
  }

  public withArray(array: string): PhenotypeValueBuilder {
    this.field.a = array;
    return this;
  }

  public withValue(value: string | number): PhenotypeValueBuilder {
    this.field.v = value;
    return this;
  }

  public build(): PhenotypeValue.Attributes {
    return this.field as PhenotypeValue.Attributes;
  }
}
