import { VariantComparisonProperty } from '@core/enums';
import { GenoMarkerRepository, GenoTiersRepository, PhenotypeFieldRepository } from '@core/repos';
import { ResourceNotFoundError } from 'errors';
import { pickBy, remove, uniq } from 'lodash';
import { PhenotypeFiltersService } from 'services/filter';
import { PhenotypeFieldUtils } from 'utils';

export class IndividualComparisonService {
  /**
   * Returns the comparison details by field and variant
   *
   * @param fieldId the filter id
   * @param variant the variant
   * @param excludeEid the participant id to be excluded.
   */
  static getComparisonByFieldAndVariant = async (
    fieldId: Filter.FilterId,
    variant: string,
    excludeEid?: string
  ): Promise<Comparison.FieldComparisonResults> => {
    // Validate first the filter.
    const filter = await PhenotypeFieldRepository.findByFilterId(fieldId);
    if (!filter) {
      throw new ResourceNotFoundError(`Cannot find filter with id ${filter}.`);
    }
    // Then get the participants for a variants to do the query for only this eids.
    const participantIds = await IndividualComparisonService.getParticipantsByVariant(variant, excludeEid);
    return IndividualComparisonService.getComparisonByFieldAndParticipants(filter, participantIds);
  };

  /**
   * Returns the participants that matched with a variant
   * @param variant
   * @param excludeEid
   */
  static getParticipantsByVariant = async (variant: string, excludeEid?: string): Promise<Array<string>> => {
    const results = await GenoTiersRepository.find({ fullLocation: variant }, { i: 1, _id: 0 });
    return uniq(results.filter((item) => item.i !== excludeEid).map((item) => item.i));
  };

  /**
   * Returns the comparison details by field and participantIds
   *
   * @param filter the filter
   * @param participantIds the participant ids
   */
  static getComparisonByFieldAndParticipants = async (
    filter: PhenotypeField.Attributes,
    participantIds: Array<string>
  ): Promise<Comparison.FieldComparisonResults> => {
    const results = await PhenotypeFiltersService.getFilterDataQuery({ filter, participantIds });

    // Then find the distinct values for the filter and count the occurrences.
    const distinctValues = await PhenotypeFieldRepository.findDistinctValuesByFilterId(filter.id);
    const valueWithCount = distinctValues.reduce((acc: any, value: any) => {
      acc[value] = PhenotypeFieldUtils.getMatchedValues(results, value);
      return acc;
    }, {});

    // Then split the results by existing and not existing values
    return {
      total: participantIds.length,
      fieldId: filter,
      existingValues: pickBy(valueWithCount, (value) => {
        return value > 0;
      }),
      notExistingValues: pickBy(valueWithCount, (value) => {
        return value === 0;
      })
    };
  };

  /**
   * Returns the participants that matched with a gene
   * @param gene
   * @param excludeEid
   */
  static getParticipantsByGene = async (gene: string, excludeEid?: string): Promise<Array<string>> => {
    // First find locations that matched with the gene
    const markerLocations = await GenoMarkerRepository.find({ Gene: gene }, { fullLocation: 1, _id: 0 });
    const locations = markerLocations.map((genoMarker) => genoMarker.fullLocation);

    // And then get the participants for the locations
    const participants = await GenoTiersRepository.find({ fullLocation: { $in: locations } }, { i: 1, _id: 0 });
    return participants.filter((item) => item.i !== excludeEid).map((item) => item.i);
  };

  /**
   * Returns the genotier distribution.
   * @param variant the variant
   * @param participantIds  the participant ids
   * @param property  the property
   */
  static getGenotierDistribution = async (
    variant: string,
    participantIds: Array<string>,
    property: VariantComparisonProperty
  ): Promise<{ _id: string; number: number }[]> => {
    const match: Record<string, unknown> = {
      i: { $in: participantIds },
      fullLocation: variant
    };
    match[property] = { $exists: true };
    return GenoTiersRepository.getAggregatedResult([
      {
        $match: match
      },
      { $group: { _id: `$${property}`, number: { $sum: 1 } } },
      { $sort: { number: -1 } }
    ]);
  };

  /**
   * Adds the comparison filter to the patient
   * @param fieldId the field id
   * @param workgroupPatient  the patient
   */
  static async addComparisonFilterToThePatient(
    fieldId: Filter.FilterId,
    workgroupPatient: PatientWorkgroup.Document
  ): Promise<PatientWorkgroup.Document> {
    if (!workgroupPatient) {
      throw new ResourceNotFoundError(`The workgroup patient doesn't exist`);
    }
    const filter = await PhenotypeFieldRepository.findByFilterId(fieldId);
    if (!filter) {
      throw new ResourceNotFoundError(`Cannot find filter with id ${fieldId}`);
    }
    if (!workgroupPatient.comparisonFilters) {
      workgroupPatient.comparisonFilters = [];
    }
    // No need to add filter is already there.
    if (
      workgroupPatient.comparisonFilters.some((existingFilterId) => `${existingFilterId}` === filter._id.toString())
    ) {
      return workgroupPatient;
    }
    // Add the filter and save.
    workgroupPatient.comparisonFilters.push(filter._id);
    await workgroupPatient.save();
    return workgroupPatient;
  }

  /**
   * Returns the comparison details by field and gene
   *
   * @param fieldId the filter id
   * @param gene the gene
   * @param excludeEid the participant id to be excluded.
   */
  static getComparisonByFieldAndGene = async (
    fieldId: Filter.FilterId,
    gene: string,
    excludeEid?: string
  ): Promise<Comparison.FieldComparisonResults> => {
    // Validate first the filter.
    const filter = await PhenotypeFieldRepository.findByFilterId(fieldId);
    if (!filter) {
      throw new ResourceNotFoundError(`Cannot find filter with id ${filter}.`);
    }
    // Then get the participants for a gene to do the query for only this eids.
    const participantIds = await IndividualComparisonService.getParticipantsByGene(gene, excludeEid);
    return IndividualComparisonService.getComparisonByFieldAndParticipants(filter, participantIds);
  };

  /**
   * Removed the comparison filter from the patient
   * @param fieldId the field id
   * @param workgroupPatient  the patient
   */
  static async removeComparisonFilterToThePatient(
    fieldId: Filter.FilterId,
    workgroupPatient: PatientWorkgroup.Document
  ): Promise<PatientWorkgroup.Document> {
    if (!workgroupPatient) {
      throw new ResourceNotFoundError(`The workgroup patient doesn't exist`);
    }
    const filter = await PhenotypeFieldRepository.findByFilterId(fieldId);
    if (!filter) {
      throw new ResourceNotFoundError(`Cannot find filter with id ${fieldId}`);
    }
    if (!workgroupPatient.comparisonFilters) {
      workgroupPatient.comparisonFilters = [];
    }
    remove(workgroupPatient.comparisonFilters, (item) => `${item}` === filter._id.toString());
    await workgroupPatient.save();
    return workgroupPatient;
  }

  /**
   * Returns the comparison graph details by field and variant
   *
   * @param variant the variant
   * @param excludeEid the participant id to be excluded.
   */
  static getComparisonGraphDataByVariant = async (
    variant: string,
    excludeEid?: string
  ): Promise<Comparison.VariantComparisonGraphResponse> => {
    // Then get the participants for a variants to do the query for only this eids.
    const participantIds = await IndividualComparisonService.getParticipantsByVariant(variant, excludeEid);
    const genotypes = await IndividualComparisonService.getGenotierDistribution(
      variant,
      participantIds,
      VariantComparisonProperty.Genotype
    );
    const acmgVerdicts = await IndividualComparisonService.getGenotierDistribution(
      variant,
      participantIds,
      VariantComparisonProperty.AcmgVerdict
    );
    // transform array of objects to a single object with _id as property name and value the number.
    return {
      genotypes: genotypes.reduce((acc, item) => Object.assign(acc, { [item._id]: item.number }), {}),
      acmgVerdicts: acmgVerdicts.reduce((acc, item) => Object.assign(acc, { [item._id]: item.number }), {})
    };
  };
}
