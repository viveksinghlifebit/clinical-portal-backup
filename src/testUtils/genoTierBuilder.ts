import { TierTypes } from '@core/enums';

export class GenoTierBuilder {
  private readonly item: Partial<GenoTier.Attributes>;

  constructor() {
    this.item = {};
  }

  public withChromosome(chromosome: string): GenoTierBuilder {
    this.item.chromosome = chromosome;
    return this;
  }

  public withFullLocation(location: string): GenoTierBuilder {
    this.item.fullLocation = location;
    return this;
  }

  public withTier(tier: TierTypes): GenoTierBuilder {
    this.item.tier = tier;
    return this;
  }

  public withPhenotype(phenotype: string): GenoTierBuilder {
    this.item.phenotype = phenotype;
    return this;
  }

  public withGene(gene?: string): GenoTierBuilder {
    this.item.gene = gene;
    return this;
  }

  public build(): GenoTier.Attributes {
    return this.item as GenoTier.Attributes;
  }
}
