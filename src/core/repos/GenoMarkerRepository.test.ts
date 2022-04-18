import { Types } from 'mongoose';
import * as connection from 'services/mongoose/connections';
import { GenoMarkerRepository } from './GenoMarkerRepository';

describe('GenoMarkerRepository', () => {
  describe('findByFullLocations', () => {
    test('should return empty array if no result is present', async () => {
      await expect(GenoMarkerRepository.findByFullLocations([])).resolves.toStrictEqual([]);
    });

    test('should return genomarkers by location', async () => {
      const genomarker = {
        _id: new Types.ObjectId(),
        fullLocation: 'test'
      };

      await connection.genomarkersConnection.collection('genomarkers').insertOne(genomarker);

      await expect(GenoMarkerRepository.findByFullLocations(['test'])).resolves.toStrictEqual([genomarker]);

      await connection.genomarkersConnection.collection('genomarkers').deleteMany({});
    });
  });

  describe('findByCNs', () => {
    test('should return empty array if no result is present', async () => {
      await expect(GenoMarkerRepository.findByCNs([])).resolves.toStrictEqual([]);
    });

    test('should return CNs', async () => {
      const genomarker1 = {
        _id: new Types.ObjectId(),
        fullLocation: 'test',
        cn: 'id-1'
      };
      const genomarker2 = {
        _id: new Types.ObjectId(),
        fullLocation: 'test',
        cn: 'id-2'
      };

      await connection.genomarkersConnection.collection('genomarkers').insertMany([genomarker1, genomarker2]);

      await expect(GenoMarkerRepository.findByCNs(['id-1', 'id-2'])).resolves.toStrictEqual([genomarker1, genomarker2]);

      await connection.genomarkersConnection.collection('genomarkers').deleteMany({});
    });
  });
});
