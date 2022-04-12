import * as connection from 'services/mongoose/connections';
import { Types } from 'mongoose';

import { PhenotypeFieldRepository } from './PhenotypeFieldRepository';

describe('Test PhenotypeFieldRepository', () => {
  describe('find', () => {
    test('should find the phenotype from phenotypefields on matching criteria', async () => {
      const phenotypefields = {
        _id: new Types.ObjectId(),
        id: 1,
        description: 'description'
      };
      await connection.clinicalPortalConnection.collection('phenotypefields').insertOne(phenotypefields);

      await expect(PhenotypeFieldRepository.find({ _id: phenotypefields._id })).resolves.toStrictEqual([
        phenotypefields
      ]);

      await connection.clinicalPortalConnection.collection('phenotypefields').deleteOne({ _id: phenotypefields._id });
    });
  });

  describe('findByFilterId', () => {
    test('should find the phenotype from findByFilterId', async () => {
      const phenotypefields = {
        _id: new Types.ObjectId(),
        id: 1,
        description: 'description'
      };
      await connection.clinicalPortalConnection.collection('phenotypefields').insertOne(phenotypefields);

      await expect(PhenotypeFieldRepository.findByFilterId(1)).resolves.toStrictEqual(phenotypefields);

      await connection.clinicalPortalConnection.collection('phenotypefields').deleteOne({ _id: phenotypefields._id });
    });
  });

  describe('findByCriteria', () => {
    afterAll(jest.restoreAllMocks);
    test('should find the phenotype from findByCriteria', async () => {
      const phenotypefields = {
        _id: new Types.ObjectId(),
        id: 1,
        description: 'description'
      };
      await connection.filtersConnection.collection('zpv_f1').insertOne(phenotypefields);

      await expect(PhenotypeFieldRepository.findByCriteria(phenotypefields.id, { id: 1 })).resolves.toStrictEqual([
        phenotypefields
      ]);

      await connection.filtersConnection.collection('zpv_f1').deleteOne({ _id: phenotypefields._id });
    });
  });
});
