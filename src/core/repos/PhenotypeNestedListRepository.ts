import { Collection } from 'mongodb';
import { ParentRepository } from './parent/MainRepository';
import * as connection from 'services/mongoose/connections';

export class PhenotypeNestedListRepository extends ParentRepository {
  private static readonly TREE_COLLECTIONS_PREFIX = 'lpv_c';

  static findByCoding(coding: string): Promise<PhenotypeNestedList.Attributes[]> {
    return PhenotypeNestedListRepository.getMongooseModel(coding).find().toArray();
  }

  private static getMongooseModel(id: string): Collection<PhenotypeNestedList.Attributes> {
    return connection.clinicalPortalConnection.collection(
      `${PhenotypeNestedListRepository.TREE_COLLECTIONS_PREFIX}${id}`
    );
  }
}
