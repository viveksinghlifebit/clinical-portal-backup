import { ParentRepository } from './parent/MainRepository';
import * as connection from 'services/mongoose/connections';

export class GenoMarkerRepository extends ParentRepository {
  /**
   * Find geno markers by location
   * @param locations  the locations
   */
  static findByFullLocations(locations: string[]): Promise<GenoMarker.Attributes[]> {
    return connection.genomarkersConnection
      .collection('genomarkers')
      .find({ fullLocation: { $in: locations } })
      .toArray() as Promise<GenoMarker.Attributes[]>;
  }

  /**
   * Find geno markers by CNs
   * @param genomicsId  the genomics id (aka CNs)
   */
  static findByCNs(genomicsId: string[]): Promise<GenoMarker.Attributes[]> {
    return connection.genomarkersConnection
      .collection('genomarkers')
      .find({ cn: { $in: genomicsId } })
      .toArray() as Promise<GenoMarker.Attributes[]>;
  }

  /**
   *
   * @param find
   * @returns genotiers
   */
  public static async find(
    query: Record<string, unknown>,
    projection: Record<string, number>
  ): Promise<Array<GenoMarker.Attributes>> {
    return (connection.genomarkersConnection
      .collection('genomarkers')
      .find(query, projection)
      .toArray() as unknown) as Promise<Array<GenoMarker.Attributes>>;
  }
}
