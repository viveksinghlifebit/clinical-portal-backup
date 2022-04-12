export class GenoMarkerBuilder {
  private readonly item: Partial<GenoMarker.Attributes>;

  constructor() {
    this.item = {};
  }

  public withCN(cn: string): GenoMarkerBuilder {
    this.item.cn = cn;
    return this;
  }

  public withFullLocation(location: string): GenoMarkerBuilder {
    this.item.fullLocation = location;
    return this;
  }

  public withGene(gene: string): GenoMarkerBuilder {
    this.item.gene = gene;
    return this;
  }

  public build(): GenoMarker.Attributes {
    return this.item as GenoMarker.Attributes;
  }
}
