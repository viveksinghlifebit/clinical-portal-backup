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
}
