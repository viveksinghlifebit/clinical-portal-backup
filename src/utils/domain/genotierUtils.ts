import { TierTypes } from '@core/enums';
import { S3Utils } from './s3Utils';

export class GenoTierUtils {
  /**
   * Find geno definition in matching with tier data
   * @param tierData  the tier data
   * @param genoMarkers the geno marker
   */
  public static findGenoDefinition(
    tierData: GenoTier.Attributes,
    genoMarkers: Array<GenoMarker.Attributes>
  ): GenoMarker.Attributes | undefined {
    return genoMarkers.find((it) => it.fullLocation === tierData.fullLocation);
  }

  /**
   * Returns the tier data from the input.
   * @param data  the data
   */
  public static getTierDistribution(data: Array<GenoTier.Attributes>): GenoTier.TierData {
    const tier1PerMarker = {} as Record<string, unknown>;
    const tier2PerMarker = {} as Record<string, unknown>;
    const tier3PerMarker = {} as Record<string, unknown>;
    data.forEach((row) => {
      // Get the marker name
      const marker = `${row.chromosome}:${row.position}`;
      // Check if for the marker there is already tier 1 data
      if (!tier1PerMarker[marker] && row.tier === TierTypes.TIER1) {
        tier1PerMarker[marker] = 1;
      }
      // Check if for the marker there is already tier 2 data
      if (!tier2PerMarker[marker] && row.tier === TierTypes.TIER2) {
        tier2PerMarker[marker] = 1;
      }
      // Check if for the marker there is already tier 3 data
      if (!tier3PerMarker[marker] && row.tier === TierTypes.TIER3) {
        tier3PerMarker[marker] = 1;
      }
    });
    return {
      tier1: Object.keys(tier1PerMarker).length,
      tier2: Object.keys(tier2PerMarker).length,
      tier3: Object.keys(tier3PerMarker).length
    };
  }

  /**
   * Returns the igv files from the phenotype values
   * @param data  the data
   */
  public static getIGVFiles(data: Array<PhenotypeValue.Attributes>): Array<string> {
    const files = data.map((it) => it.v);
    return files.map((file) => S3Utils.getHttpURLFromS3(file as string));
  }

  /**
   * Returns the diseases with varients from the input data
   * @param data  the data
   */
  public static getDiseasesWithVariants(data: Array<GenoTier.Attributes>): Record<string, string> {
    const diseaseSet = data.reduce<Record<string, Set<string>>>((acc, it) => {
      if (!acc[it.phenotype]) {
        // Create new set (we need distinct value) for each disease.
        acc[it.phenotype] = new Set();
      }
      acc[it.phenotype]?.add(it.gene);
      return acc;
    }, {});
    // Then transform the disease object
    const disease = {} as Record<string, string>;
    for (const item in diseaseSet) {
      disease[item] = [...(diseaseSet[item] as Set<string>)].join(';');
    }
    return disease;
  }

  /**
   * Returns the associated diseases with tiered variants.
   * @param data the data
   * @param genoMarkers the genoMarkers
   */
  static getAssociatedDiseasesWithTieredVariants(
    data: Array<GenoTier.TierDiseasesDistribution>,
    genoMarkers: Array<GenoMarker.Attributes>
  ): Array<GenoTier.TierDataDiseases> {
    // Add the gene to the results
    const resultsWithGenes = data.reduce<
      {
        gene: string;
        _id: {
          phenotype: string;
        };
        tier1: number;
        tier2: number;
        tier3: number;
      }[]
    >((acc, it) => {
      const geno = genoMarkers.find((g) => g.fullLocation === it._id.marker);
      if (geno) {
        it.gene = geno.gene;
      } else {
        it.gene = it._id.marker;
      }
      acc.push(it);
      return acc;
    }, []);
    // The format the results
    const formattedResults = resultsWithGenes.reduce<GenoTier.TierDataDiseases[]>((acc, it) => {
      const item: GenoTier.TierDataDiseases = {
        gene: it.gene,
        phenotype: it._id.phenotype,
        tier1: it.tier1,
        tier2: it.tier2,
        tier3: it.tier3
      };
      acc.push(item);
      return acc;
    }, []);
    // Keep only first 8 results
    return formattedResults.slice(0, 8);
  }
}
