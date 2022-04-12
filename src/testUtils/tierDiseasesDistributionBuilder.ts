export class TierDiseasesDistributionBuilder {
  private readonly item: Partial<GenoTier.TierDiseasesDistribution>;

  constructor() {
    this.item = {};
  }

  public withGene(gene: string): TierDiseasesDistributionBuilder {
    this.item.gene = gene;
    return this;
  }

  public withId(id: GenoTier.TierPhenotypeGene): TierDiseasesDistributionBuilder {
    this.item._id = id;
    return this;
  }

  public withTier1(tier1: number): TierDiseasesDistributionBuilder {
    this.item.tier1 = tier1;
    return this;
  }

  public withTier2(tier2: number): TierDiseasesDistributionBuilder {
    this.item.tier2 = tier2;
    return this;
  }

  public withTier3(tier3: number): TierDiseasesDistributionBuilder {
    this.item.tier3 = tier3;
    return this;
  }

  public build(): GenoTier.TierDiseasesDistribution {
    return this.item as GenoTier.TierDiseasesDistribution;
  }
}
