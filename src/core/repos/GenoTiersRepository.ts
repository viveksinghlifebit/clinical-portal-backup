import * as connection from 'services/mongoose/connections';
import { Collection } from 'mongodb';

export class GenoTiersRepository {
  private static PATIENT_COLLECTIONS_PREFIX = 'ptd_i';

  /**
   * Returns the mongoose model.
   * @param eid the eid
   * @private
   */
  private static getMongooseModel(eid: string): Collection<GenoTier.Attributes> {
    return connection.genomarkersConnection.collection(`${GenoTiersRepository.PATIENT_COLLECTIONS_PREFIX}${eid}`);
  }

  /**
   * Creates the participant collection.
   * @param eid the eid
   * @param lean the lean
   */
  static findGenotierData(eid: string): Promise<Array<GenoTier.Attributes>> {
    return (GenoTiersRepository.getMongooseModel(eid).find({}).toArray() as unknown) as Promise<
      Array<GenoTier.Attributes>
    >;
  }

  /**
   * Remove the geno tier data.
   * @param eid the eid
   */
  static async findAggregatedTierDataForPatient(eid: string): Promise<Array<GenoTier.TierDiseasesDistribution>> {
    return connection.genomarkersConnection
      .collection('genotiers')
      .aggregate(GenoTiersRepository.getAggregatedTierDataQuery(eid))
      .toArray() as Promise<Array<GenoTier.TierDiseasesDistribution>>;
  }
  /**
   * Returns the query for the aggregation.
   * @param eid the eid
   * @private
   */
  private static getAggregatedTierDataQuery(eid: string): Array<Record<any, any>> {
    return [
      {
        $match: {
          i: eid
        }
      },
      {
        $group: {
          _id: {
            phenotype: '$phenotype',
            marker: '$location'
          },
          tier1: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $eq: ['$tier', 'TIER1']
                    }
                  ]
                },
                1,
                0
              ]
            }
          },
          tier2: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $eq: ['$tier', 'TIER2']
                    }
                  ]
                },
                1,
                0
              ]
            }
          },
          tier3: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $eq: ['$tier', 'TIER3']
                    }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { tier1: -1, tier2: -1, tier3: -1 }
      }
    ];
  }
}
