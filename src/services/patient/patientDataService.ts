import { GenoMarkerRepository, GenoTiersRepository, PhenotypeFieldRepository } from '@core/repos';
import { GenoTierUtils } from 'utils';

export class PatientDataService {
  private static IGV_FIELD_ID = 1;

  /**
   * Creates the patient data.
   * @param patient the patient
   * @param participantId the participant id
   */
  static async createPatientData(patient: PatientWorkgroup.Attributes, participantId: string): Promise<void> {
    patient.tierSNV = await PatientDataService.getTierDistribution(participantId);
    patient.diseaseGene = await PatientDataService.getDiseasesWithVariants(participantId);
    patient.igvFiles = await PatientDataService.getIGVFiles(participantId);
    patient.associatedDiseasesWithTieredVariants = await PatientDataService.getAssociatedDiseasesWithTieredVariants(
      participantId
    );
  }

  /**
   * Returns the tier distribution.
   * @param eid the eid
   */
  static async getTierDistribution(eid: string): Promise<GenoTier.TierData> {
    // First load the tier data
    const data: Array<GenoTier.Attributes> = await GenoTiersRepository.findGenotierData(eid, true);
    return GenoTierUtils.getTierDistribution(data);
  }

  /**
   * Returns the tier distribution.
   * @param eid the eid
   */
  static async getIGVFiles(eid: string): Promise<Array<string>> {
    const data: Array<PhenotypeValue.Attributes> = await PhenotypeFieldRepository.findByCriteria(
      PatientDataService.IGV_FIELD_ID,
      {
        i: eid
      }
    );
    return GenoTierUtils.getIGVFiles(data);
  }

  /**
   * Returns the tier distribution.
   * @param eid the eid
   */
  static async getDiseasesWithVariants(eid: string): Promise<Record<string, string>> {
    const data = await GenoTiersRepository.findGenotierData(eid, true);
    return GenoTierUtils.getDiseasesWithVariants(data);
  }

  /**
   * Returns the associated diseases with tiered variants
   * @param eid the eid
   */
  static async getAssociatedDiseasesWithTieredVariants(eid: string): Promise<Array<GenoTier.TierDataDiseases>> {
    // Get all results for each phenotype and gene.
    const results = await GenoTiersRepository.findAggregatedTierDataForPatient(eid);
    // The find all marker positions
    const markerPositions = results.map((it) => it._id.marker);
    // The find the definition of the geno markers
    const genoMarkers = await GenoMarkerRepository.findByFullLocations(markerPositions);
    return GenoTierUtils.getAssociatedDiseasesWithTieredVariants(results, genoMarkers);
  }
}
