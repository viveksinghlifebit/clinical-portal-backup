import { ParentRepository } from './parent/MainRepository';
import * as connection from 'services/mongoose/connections';
import { Collection, Sort } from 'mongodb';
import { ValidationUtils } from 'utils';

export class PhenotypeFieldRepository extends ParentRepository {
  /**
   * Returns the filter distinct values by id
   * @param filterId the filter id
   */
  public static async findDistinctValuesByFilterId(filterId: Filter.FilterId): Promise<Array<string | number>> {
    return (this.getMongooseModel(filterId).distinct('v') as unknown) as Array<string | number>;
  }

  /**
   * The collection pattern for filter collections.
   * @private
   */
  private static readonly FIELD_COLLECTIONS_PREFIX = 'zpv_f';

  static findByFilterId(id: number | string): Promise<PhenotypeField.Attributes> {
    return connection.clinicalPortalConnection
      .collection('phenotypefields')
      .findOne({ id }) as Promise<PhenotypeField.Attributes>;
  }

  /**
   * Finds by criteria
   * @param filterId the filter id
   * @param criteria  the criteria
   */
  public static async findByCriteria(
    filterId: Filter.FilterId,
    criteria: Record<string, unknown>
  ): Promise<Array<PhenotypeValue.Attributes>> {
    return (this.getMongooseModel(filterId).find(criteria).toArray() as unknown) as Array<PhenotypeValue.Attributes>;
  }

  /**
   * Returns the mongoose model.
   * @param filterId the filter id
   * @private
   */
  public static getMongooseModel(filterId: Filter.FilterId): Collection<PhenotypeValue.Attributes> {
    return connection.filtersConnection.collection(`${PhenotypeFieldRepository.FIELD_COLLECTIONS_PREFIX}${filterId}`);
  }

  /**
   * Finds phenotype fields by query conditions
   * @param  conditions query conditions
   * @param  lean lean flag
   */
  static find(conditions: Mongoose.QueryConditions, projection = {}): Promise<PhenotypeField.Attributes[]> {
    return connection.clinicalPortalConnection
      .collection('phenotypefields')
      .find(conditions, projection)
      .toArray() as Promise<PhenotypeField.Attributes[]>;
  }

  /**
   * Finds the aggregation data for term and pagination.
   * @param filterId  the filter id
   * @param instances the instances
   * @param pageSize  the page size
   * @param pageNumber  the page number
   * @param participantIds  the participant ids
   * @param term  the term
   */
  public static async findAggregationDataForTermWithPagination(
    filterId: Filter.FilterId,
    instances: string[],
    pageSize = 20,
    pageNumber = 0,
    participantIds?: string[],
    term?: string | Array<string | number>
  ): Promise<Filter.FilterAggregateResult[]> {
    const criteria = await this.getAggregationQueryCriteria(instances, participantIds);
    if (typeof term === 'string' && term !== '') {
      criteria[0]!['$match'].v = { $regex: term, $options: 'i' };
    } else if (Array.isArray(term)) {
      criteria[0]!['$match'].v = { $in: term };
    }
    // Grouping
    criteria.push({ $group: { _id: '$v', number: { $sum: 1 } } });
    // Pagination
    criteria.push({ $skip: pageNumber * pageSize });
    criteria.push({ $limit: pageSize });
    return this.doAggregatedQueryForCriteria(filterId, criteria);
  }

  /**
   * Returns the aggregation query criteria
   * @param instances the instances
   * @param participantIds the participant ids
   */
  public static async getAggregationQueryCriteria(
    instances?: string[],
    participantIds?: string[]
  ): Promise<Record<string, any>[]> {
    const conditions = [];
    if (instances) {
      if (participantIds && (await this.shouldAddParticipantsInQuery(participantIds.length))) {
        conditions.push({ $match: { i: { $in: participantIds }, is: { $in: instances } } });
      } else {
        conditions.push({ $match: { is: { $in: instances } } });
      }
    } else {
      if (participantIds && (await this.shouldAddParticipantsInQuery(participantIds.length))) {
        conditions.push({ $match: { i: { $in: participantIds } } });
      }
    }
    return conditions;
  }

  /**
   * Do the query for the aggregation.
   * @param filterId  the filter id
   * @param criteria  the criteria
   * @private
   */
  private static async doAggregatedQueryForCriteria(
    filterId: Filter.FilterId,
    criteria: Record<string, unknown>[]
  ): Promise<Filter.FilterAggregateResult[]> {
    return (this.getMongooseModel(filterId).aggregate(criteria) as unknown) as Filter.FilterAggregateResult[];
  }

  /**
   * Finds the minimum value for the filter.
   * @param filterId  the filter id
   * @param instances the instances
   * @param participantIds  the participant ids
   */
  public static async findMin(
    filterId: Filter.FilterId,
    instances: string[],
    participantIds?: string[]
  ): Promise<Filter.FilterValue | undefined> {
    const conditions = await this.getFindQueryCriteria(instances, participantIds);
    return this.findPhenotypeSingleValue(this.getMongooseModel(filterId), conditions, { v: 1 });
  }

  /**
   * Finds the maximum value for the filter.
   * @param filterId  the filter id
   * @param instances the instances
   * @param participantIds  the participant ids
   */
  public static async findMax(
    filterId: Filter.FilterId,
    instances: string[],
    participantIds?: string[]
  ): Promise<Filter.FilterValue | undefined> {
    const conditions = await this.getFindQueryCriteria(instances, participantIds);
    return this.findPhenotypeSingleValue(this.getMongooseModel(filterId), conditions, { v: -1 });
  }

  /**
   * Returns the find query criteria
   * @param instances the instances
   * @param participantIds the participant ids
   */
  public static async getFindQueryCriteria(
    instances: string[],
    participantIds?: string[]
  ): Promise<Record<string, unknown>[]> {
    const conditions = await this.getAggregationQueryCriteria(instances, participantIds);
    return conditions[0]!['$match'];
  }

  /**
   * Returns the single phenotype value by criteria
   * @param model the model
   * @param conditions  the condition
   * @param sort  the sorting {v: 1} for value ascending
   */
  public static async findPhenotypeSingleValue(
    model: Collection<PhenotypeValue.Attributes>,
    conditions: Record<string, unknown>[],
    sort: Record<string, number>
  ): Promise<Filter.FilterValue | undefined> {
    const result = ((await model
      .find(conditions)
      .sort(sort as Sort)
      .limit(1)) as unknown) as PhenotypeValue.Attributes;
    if (result) {
      return result.v;
    }
    return undefined;
  }

  /**
   * Finds the aggregated data for the query
   * @param filterId  the filter id
   * @param instances the instances
   * @param participantIds  the participant ids
   * @param values  the values
   */
  public static async findAggregationData(
    filterId: Filter.FilterId,
    values: string[],
    instances?: string[],
    participantIds?: string[]
  ): Promise<Filter.FilterAggregateResult[]> {
    const criteria = await this.getAggregationQueryCriteria(instances, participantIds);
    if (ValidationUtils.isArrayNotEmpty(values)) {
      criteria[0]!['$match'].v = { $in: values };
    }
    criteria.push({ $group: { _id: '$v', number: { $sum: 1 } } });
    return this.doAggregatedQueryForCriteria(filterId, criteria);
  }

  /**
   * Finds the aggregation boundary from the input.
   * @param boundaries the boundaries
   * @param filterId  the filter id
   * @param instances the instances
   * @param participantIds  the participant ids
   */
  public static async findAggregationForBoundary(
    boundaries: Filter.FilterValue[],
    filterId: Filter.FilterId,
    instances: string[],
    participantIds: string[]
  ): Promise<Filter.FilterAggregateResult[]> {
    const criteria = await this.getAggregationQueryCriteria(instances, participantIds);
    criteria.push({
      $bucket: {
        groupBy: '$v',
        boundaries: boundaries,
        default: 'Other',
        output: {
          number: { $sum: 1 }
        }
      }
    });
    return this.doAggregatedQueryForCriteria(filterId, criteria);
  }
}
