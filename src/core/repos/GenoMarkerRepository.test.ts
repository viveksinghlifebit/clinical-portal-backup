import { Types } from 'mongoose';
import * as connection from 'services/mongoose/connections';
import { GenoMarkerRepository } from './GenoMarkerRepository';

describe('GenoMarkerRepository', () => {
  describe('findByFullLocations', () => {
    test('should return empty array if no result is present', async () => {
      await expect(GenoMarkerRepository.findByFullLocations([])).resolves.toStrictEqual([]);
    });

    test('should return true if number of particiapnts is less than participant repository count', async () => {
      const genomarker = {
        _id: new Types.ObjectId(),
        fullLocation: 'test'
      };

      await connection.genomarkersConnection.collection('genomarkers').insertOne(genomarker);

      await expect(GenoMarkerRepository.findByFullLocations(['test'])).resolves.toStrictEqual([genomarker]);

      await connection.genomarkersConnection.collection('genomarkers').deleteMany({});
    });
  });
});
