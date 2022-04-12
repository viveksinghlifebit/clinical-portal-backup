import { ParentRepository } from './parent/MainRepository';
import * as connection from 'services/mongoose/connections';
import { Collection } from 'mongodb';

export class PhenotypeFieldRepository extends ParentRepository {
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
}
