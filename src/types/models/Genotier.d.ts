declare namespace GenoTier {
  interface Attributes {
    _id: Mongoose.ObjectId;
    i: string;
    phenotype: string;
    gene: string;
    chromosome: string;
    position: string;
    location: string;
    fullLocation: string;
    tier: TierType;
  }

  type TierType = 'TIER1' | 'TIER2' | 'TIER3';

  interface TierPhenotypeGene {
    phenotype: string;
    marker: string;
  }

  interface TierDiseasesDistribution extends TierData {
    _id: TierPhenotypeGene;
    gene: string;
  }

  interface TierData {
    tier1: number;
    tier2: number;
    tier3: number;
  }

  interface TierDataDiseases extends TierData {
    gene: string;
    phenotype: string;
  }

  interface TierDiseasesDistribution extends TierData {
    _id: TierPhenotypeGene;
    gene: string;
  }
}
