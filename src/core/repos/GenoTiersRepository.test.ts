import { Types } from 'mongoose';
import * as connection from 'services/mongoose/connections';
import { GenoTiersRepository } from './GenoTiersRepository';

describe('GenoTiersRepository', () => {
  describe('findGenotierData', () => {
    afterAll(jest.restoreAllMocks);
    test('should return Genotier from the passed eid collection', async () => {
      const genotier = {
        _id: new Types.ObjectId(),
        i: '00001',
        expireAt: new Date()
      };
      await connection.genomarkersConnection.collection('ptd_i00001').insertOne(genotier);

      const result = await GenoTiersRepository.findGenotierData('00001');
      expect(result[0]?._id.toHexString()).toBe(genotier._id.toHexString());

      await connection.genomarkersConnection.collection('ptd_i00001').deleteMany(genotier);
    });
  });

  describe('findAggregatedTierDataForPatient', () => {
    test('should return aggregated result', async () => {
      const genotier = {
        _id: new Types.ObjectId(),
        i: 'P0000190',
        location: '1:41382200'
      };
      await connection.genomarkersConnection.collection('genotiers').insertOne(genotier);

      const result = await GenoTiersRepository.findAggregatedTierDataForPatient('P0000190');

      expect(result[0]).toStrictEqual({
        _id: {
          marker: '1:41382200'
        },
        tier1: 0,
        tier2: 0,
        tier3: 0
      });
      await connection.genomarkersConnection.collection('genotiers').deleteMany(genotier);
    });
  });
});
