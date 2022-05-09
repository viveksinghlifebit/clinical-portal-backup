import mongoose from 'mongoose';

import { GenoMarkerRepository, GenoTiersRepository } from '@core/repos';
import { IndividualComparisonService } from './comparison.controller';
import { PhenotypeFieldRepository } from '../../repos';
import { ResourceNotFoundError } from '../../../errors';
import {
  PatientBuilder,
  PatientWorkgroupBuilder,
  PhenotypeTestFieldBuilder,
  TeamBuilder,
  UserBuilder,
  WorkgroupBuilder
} from 'testUtils';
import { PhenotypeFiltersService } from 'services/filter/phenotypeFilterService';
import { PatientStatus, VariantComparisonProperty } from 'enums';

jest.mock('@core/repos/GenoTiersRepository', () => ({ find: jest.fn() }));

const team = new TeamBuilder().withName('Team').withId('1').build();
const user = new UserBuilder().withName('User').withId('2').build();
const workgroup = new WorkgroupBuilder()
  .withId('id')
  .withName('Test Name')
  .withTeam(String(team._id))
  .withOwner(String(user._id))
  .withNumberOfPatients(1)
  .build();
const patient = new PatientBuilder()
  .withId(new mongoose.Types.ObjectId())
  .withI('P0000000001')
  .withExternalID('externalId')
  .withExternalIDType('type')
  .withStatus(PatientStatus.Drafted)
  .withName('aName')
  .withSurname('aSurname')
  .build();

const getMockedGenoTiersRepositoryInstance = (response: unknown): jest.SpyInstance => {
  const spy: jest.SpyInstance = jest.spyOn(GenoTiersRepository, 'find');
  spy.mockReturnValueOnce(response);
  return spy;
};

jest.mock('@core/repos/GenoMarkerRepository', () => ({ find: jest.fn() }));
const getMockedGenoMarkerRepositoryInstance = (response: unknown): jest.SpyInstance => {
  const spy: jest.SpyInstance = jest.spyOn(GenoMarkerRepository, 'find');
  spy.mockReturnValueOnce(response);
  return spy;
};

const getMockedFindByFilterId = (response: unknown): jest.SpyInstance => {
  const spy: jest.SpyInstance = jest.spyOn(PhenotypeFieldRepository, 'findByFilterId');
  spy.mockReturnValueOnce(response);
  return spy;
};

const getMockedGetParticipantsByVariant = (response: unknown): jest.SpyInstance => {
  const spy: jest.SpyInstance = jest.spyOn(IndividualComparisonService, 'getParticipantsByVariant');
  spy.mockReturnValueOnce(response);
  return spy;
};

const getMockedGetFilterDataQuery = (response: unknown): jest.SpyInstance => {
  const spy: jest.SpyInstance = jest.spyOn(PhenotypeFiltersService, 'getFilterDataQuery');
  spy.mockReturnValueOnce(response);
  return spy;
};

const getMockedFindDistinctValuesByFilterId = (response: unknown): jest.SpyInstance => {
  const spy: jest.SpyInstance = jest.spyOn(PhenotypeFieldRepository, 'findDistinctValuesByFilterId');
  spy.mockReturnValueOnce(response);
  return spy;
};

const getMockedGetParticipantsByGene = (response: unknown): jest.SpyInstance => {
  const spy: jest.SpyInstance = jest.spyOn(IndividualComparisonService, 'getParticipantsByGene');
  spy.mockReturnValueOnce(response);
  return spy;
};

const getMockedGenoTiersRepositoryAggregation = (response: unknown): jest.SpyInstance => {
  const spy: jest.SpyInstance = jest.spyOn(GenoTiersRepository, 'getAggregatedResult');
  spy.mockReturnValueOnce(response);
  return spy;
};

describe('Test IndividualComparisonService', () => {
  const variant = 'aVariant';
  let patientWorkgroup: PatientWorkgroup.Document;
  const gene = 'aGene';
  const filterId = 1;
  const filter = new PhenotypeTestFieldBuilder().withId(filterId).with_id('filterId').build();

  beforeEach(() => {
    patientWorkgroup = new PatientWorkgroupBuilder().withId('id').withPatient(patient).withWorkgroup(workgroup).build();
    patientWorkgroup.save = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getParticipantsByVariant', () => {
    test('When Mongo returns empty results, should return empty as well', async () => {
      const GenoTiersRepositoryMock = getMockedGenoTiersRepositoryInstance([]);
      const participantIds = await IndividualComparisonService.getParticipantsByVariant(variant);
      expect(participantIds).toStrictEqual([]);
      expect(GenoTiersRepositoryMock).toBeCalledWith({ fullLocation: variant }, { i: 1, _id: 0 });
    });

    test('When Mongo returns not empty results, should return the participant ids', async () => {
      const GenoTiersRepositoryMock = getMockedGenoTiersRepositoryInstance([
        {
          i: '1'
        },
        {
          i: '2'
        }
      ]);
      const participantIds = await IndividualComparisonService.getParticipantsByVariant(variant);
      expect(participantIds).toStrictEqual(['1', '2']);
      expect(GenoTiersRepositoryMock).toBeCalledWith({ fullLocation: variant }, { i: 1, _id: 0 });
    });

    test('when exclude id is specified, should excluded from results', async () => {
      const GenoTiersRepositoryMock = getMockedGenoTiersRepositoryInstance([
        {
          i: '1'
        },
        {
          i: '2'
        }
      ]);
      const participantIds = await IndividualComparisonService.getParticipantsByVariant(variant, '1');
      expect(participantIds).toStrictEqual(['2']);
      expect(GenoTiersRepositoryMock).toBeCalledWith({ fullLocation: variant }, { i: 1, _id: 0 });
    });

    test('when results with more than one participant ids, then return distinct', async () => {
      const GenoTiersRepositoryMock = getMockedGenoTiersRepositoryInstance([
        {
          i: '1'
        },
        {
          i: '2'
        },
        {
          i: '2'
        }
      ]);
      const participantIds = await IndividualComparisonService.getParticipantsByVariant(variant);
      expect(participantIds).toStrictEqual(['1', '2']);
      expect(GenoTiersRepositoryMock).toBeCalledWith({ fullLocation: variant }, { i: 1, _id: 0 });
    });
  });
  describe('getComparisonByFieldAndVariant', () => {
    test('When filter not exists, should return an error', async () => {
      getMockedFindByFilterId(undefined);
      expect(IndividualComparisonService.getComparisonByFieldAndVariant(filterId, variant)).rejects.toThrowError(
        ResourceNotFoundError
      );
    });

    describe('When filter is valid', () => {
      test('when there are data, should call the correct methods', async () => {
        const findByFilterIdMock = getMockedFindByFilterId(filter);
        const getParticipantsByVariantMock = getMockedGetParticipantsByVariant(['1', '2']);
        const getFilterDataQueryMock = getMockedGetFilterDataQuery([
          {
            _id: 'Cardiovascular disorders',
            number: 0,
            total: 0,
            label: 'Cardiovascular disorders'
          }
        ]);
        const getFindDistinctValuesByFilterIdMock = getMockedFindDistinctValuesByFilterId(['Cardiovascular disorders']);
        await IndividualComparisonService.getComparisonByFieldAndVariant(filterId, variant);
        expect(findByFilterIdMock).toBeCalledWith(filterId);
        expect(getParticipantsByVariantMock).toBeCalledWith(variant, undefined);
        expect(getFilterDataQueryMock).toBeCalledWith({ filter, participantIds: ['1', '2'] });
        expect(getFindDistinctValuesByFilterIdMock).toBeCalledWith(filterId);
      });

      test('When participants are empty, should return empty response', async () => {
        getMockedFindByFilterId(filter);
        getMockedGetParticipantsByVariant([]);
        getMockedGetFilterDataQuery([]);
        getMockedFindDistinctValuesByFilterId([]);
        const response = await IndividualComparisonService.getComparisonByFieldAndVariant(filterId, variant);
        expect(response).toStrictEqual({
          total: 0,
          fieldId: filter,
          existingValues: {},
          notExistingValues: {}
        });
      });

      test('When values have no zero count, should be split correctly', async () => {
        getMockedFindByFilterId(filter);
        getMockedGetParticipantsByVariant(['1', '2']);
        getMockedGetFilterDataQuery([
          {
            _id: 'Cardiovascular disorders',
            number: 0,
            total: 0,
            label: 'Cardiovascular disorders'
          },
          {
            _id: 'Ciliopathies',
            number: 1,
            total: 1,
            label: 'Ciliopathies'
          },
          {
            _id: 'Dermatological disorders',
            number: 5,
            total: 5,
            label: 'Dermatological disorders'
          }
        ]);
        getMockedFindDistinctValuesByFilterId(['Cardiovascular disorders', 'Ciliopathies', 'Dermatological disorders']);
        const response = await IndividualComparisonService.getComparisonByFieldAndVariant(filterId, variant);
        expect(response).toStrictEqual({
          total: 2,
          fieldId: filter,
          existingValues: {
            Ciliopathies: 1,
            'Dermatological disorders': 5
          },
          notExistingValues: {
            'Cardiovascular disorders': 0
          }
        });
      });

      test('When values have only no zero count, the notExistingValues should be empty', async () => {
        getMockedFindByFilterId(filter);
        getMockedGetParticipantsByVariant(['1', '2']);
        getMockedGetFilterDataQuery([
          {
            _id: 'Ciliopathies',
            number: 1,
            total: 1,
            label: 'Ciliopathies'
          },
          {
            _id: 'Dermatological disorders',
            number: 5,
            total: 5,
            label: 'Dermatological disorders'
          }
        ]);
        getMockedFindDistinctValuesByFilterId(['Ciliopathies', 'Dermatological disorders']);
        const response = await IndividualComparisonService.getComparisonByFieldAndVariant(filterId, variant);
        expect(response).toStrictEqual({
          total: 2,
          fieldId: filter,
          existingValues: {
            Ciliopathies: 1,
            'Dermatological disorders': 5
          },
          notExistingValues: {}
        });
      });

      test('When values have only zero count, the existingValues should be empty', async () => {
        getMockedFindByFilterId(filter);
        getMockedGetParticipantsByVariant(['1', '2']);
        getMockedGetFilterDataQuery([
          {
            _id: 'Ciliopathies',
            number: 0,
            total: 0,
            label: 'Ciliopathies'
          },
          {
            _id: 'Dermatological disorders',
            number: 0,
            total: 0,
            label: 'Dermatological disorders'
          }
        ]);
        getMockedFindDistinctValuesByFilterId(['Ciliopathies', 'Dermatological disorders']);
        const response = await IndividualComparisonService.getComparisonByFieldAndVariant(filterId, variant);
        expect(response).toStrictEqual({
          total: 2,
          fieldId: filter,
          notExistingValues: {
            Ciliopathies: 0,
            'Dermatological disorders': 0
          },
          existingValues: {}
        });
      });
    });
  });

  describe('addComparisonFilterToThePatient', () => {
    test('When patient workgroup is undefined, should return error', async () => {
      getMockedFindByFilterId(filter);
      expect(
        IndividualComparisonService.addComparisonFilterToThePatient(
          1,
          (undefined as unknown) as PatientWorkgroup.Document
        )
      ).rejects.toThrowError(ResourceNotFoundError);
    });
    test('When values have only zero count, the existingValues should be empty', async () => {
      getMockedFindByFilterId(filter);
      getMockedGetParticipantsByVariant(['1', '2']);
      getMockedGetFilterDataQuery([
        {
          _id: 'Ciliopathies',
          number: 0,
          total: 0,
          label: 'Ciliopathies'
        },
        {
          _id: 'Dermatological disorders',
          number: 0,
          total: 0,
          label: 'Dermatological disorders'
        }
      ]);
      getMockedFindDistinctValuesByFilterId(['Ciliopathies', 'Dermatological disorders']);
      const response = await IndividualComparisonService.getComparisonByFieldAndVariant(filterId, variant);
      expect(response).toStrictEqual({
        total: 2,
        fieldId: filter,
        notExistingValues: {
          Ciliopathies: 0,
          'Dermatological disorders': 0
        },
        existingValues: {}
      });
    });
  });
  describe('getParticipantsByGene', () => {
    test('When Mongo returns empty results, should return empty as well', async () => {
      const GenoMarkerRepositoryMock = getMockedGenoMarkerRepositoryInstance([]);
      const participantIds = await IndividualComparisonService.getParticipantsByGene(gene);
      expect(participantIds).toStrictEqual([]);
      expect(GenoMarkerRepositoryMock).toBeCalledWith({ Gene: gene }, { fullLocation: 1, _id: 0 });
    });

    test('When field id is not valid, should return error', async () => {
      getMockedFindByFilterId(undefined);
      expect(IndividualComparisonService.addComparisonFilterToThePatient(1, patientWorkgroup)).rejects.toThrowError(
        ResourceNotFoundError
      );
    });

    test('When field id is valid, should be added to the comparison filters', async () => {
      getMockedFindByFilterId(filter);
      const response = await IndividualComparisonService.addComparisonFilterToThePatient(1, patientWorkgroup);
      expect(response.comparisonFilters).toStrictEqual([filter._id]);
    });

    test('When field already exists to the list, no changed', async () => {
      getMockedFindByFilterId(filter);
      patientWorkgroup.comparisonFilters = [filter._id];
      const response = await IndividualComparisonService.addComparisonFilterToThePatient(filter.id, patientWorkgroup);
      expect(response.comparisonFilters).toStrictEqual([filter._id]);
    });

    test('When Mongo returns not empty results, should return the participant ids', async () => {
      const GenoMarkerRepositoryMock = getMockedGenoMarkerRepositoryInstance([
        {
          fullLocation: '26:14582'
        },
        {
          fullLocation: '26:14552'
        }
      ]);
      const GenoTiersRepositoryMock = getMockedGenoTiersRepositoryInstance([
        {
          i: '1'
        },
        {
          i: '2'
        }
      ]);
      const participantIds = await IndividualComparisonService.getParticipantsByGene(gene);
      expect(participantIds).toStrictEqual(['1', '2']);
      expect(GenoMarkerRepositoryMock).toBeCalledWith({ Gene: gene }, { fullLocation: 1, _id: 0 });
      expect(GenoTiersRepositoryMock).toBeCalledWith(
        { fullLocation: { $in: ['26:14582', '26:14552'] } },
        { i: 1, _id: 0 }
      );
    });

    test('when exclude id is specified, should excluded from results', async () => {
      const GenoMarkerRepositoryMock = getMockedGenoMarkerRepositoryInstance([
        {
          fullLocation: '26:14582'
        },
        {
          fullLocation: '26:14552'
        }
      ]);
      const GenoTiersRepositoryMock = getMockedGenoTiersRepositoryInstance([
        {
          i: '1'
        },
        {
          i: '2'
        }
      ]);
      const participantIds = await IndividualComparisonService.getParticipantsByGene(gene, '1');
      expect(participantIds).toStrictEqual(['2']);
      expect(GenoMarkerRepositoryMock).toBeCalledWith({ Gene: gene }, { fullLocation: 1, _id: 0 });
      expect(GenoTiersRepositoryMock).toBeCalledWith(
        { fullLocation: { $in: ['26:14582', '26:14552'] } },
        { i: 1, _id: 0 }
      );
    });
  });

  describe('getComparisonByFieldAndGene', () => {
    test('When filter not exists, should return an error', async () => {
      getMockedFindByFilterId(undefined);
      expect(IndividualComparisonService.getComparisonByFieldAndGene(filterId, gene)).rejects.toThrowError(
        ResourceNotFoundError
      );
    });

    describe('When filter is valid', () => {
      test('when there are data, should call the correct methods', async () => {
        const findByFilterIdMock = getMockedFindByFilterId(filter);
        const getParticipantsByGeneMock = getMockedGetParticipantsByGene(['1', '2']);
        const getFilterDataQueryMock = getMockedGetFilterDataQuery([
          {
            _id: 'Cardiovascular disorders',
            number: 0,
            total: 0,
            label: 'Cardiovascular disorders'
          }
        ]);
        const getFindDistinctValuesByFilterIdMock = getMockedFindDistinctValuesByFilterId(['Cardiovascular disorders']);
        await IndividualComparisonService.getComparisonByFieldAndGene(filterId, gene);
        expect(findByFilterIdMock).toBeCalledWith(filterId);
        expect(getParticipantsByGeneMock).toBeCalledWith(gene, undefined);
        expect(getFilterDataQueryMock).toBeCalledWith({ filter, participantIds: ['1', '2'] });
        expect(getFindDistinctValuesByFilterIdMock).toBeCalledWith(filterId);
      });

      test('When participants are empty, should return empty response', async () => {
        getMockedFindByFilterId(filter);
        getMockedGetParticipantsByGene([]);
        getMockedGetFilterDataQuery([]);
        getMockedFindDistinctValuesByFilterId([]);
        const response = await IndividualComparisonService.getComparisonByFieldAndGene(filterId, gene);
        expect(response).toStrictEqual({
          total: 0,
          fieldId: filter,
          existingValues: {},
          notExistingValues: {}
        });
      });

      test('When values have no zero count, should be split correctly', async () => {
        getMockedFindByFilterId(filter);
        getMockedGetParticipantsByGene(['1', '2']);
        getMockedGetFilterDataQuery([
          {
            _id: 'Cardiovascular disorders',
            number: 0,
            total: 0,
            label: 'Cardiovascular disorders'
          },
          {
            _id: 'Ciliopathies',
            number: 1,
            total: 1,
            label: 'Ciliopathies'
          },
          {
            _id: 'Dermatological disorders',
            number: 5,
            total: 5,
            label: 'Dermatological disorders'
          }
        ]);
        getMockedFindDistinctValuesByFilterId(['Cardiovascular disorders', 'Ciliopathies', 'Dermatological disorders']);
        const response = await IndividualComparisonService.getComparisonByFieldAndGene(filterId, gene);
        expect(response).toStrictEqual({
          total: 2,
          fieldId: filter,
          existingValues: {
            Ciliopathies: 1,
            'Dermatological disorders': 5
          },
          notExistingValues: {
            'Cardiovascular disorders': 0
          }
        });
      });

      test('When values have only no zero count, the notExistingValues should be empty', async () => {
        getMockedFindByFilterId(filter);
        getMockedGetParticipantsByGene(['1', '2']);
        getMockedGetFilterDataQuery([
          {
            _id: 'Ciliopathies',
            number: 1,
            total: 1,
            label: 'Ciliopathies'
          },
          {
            _id: 'Dermatological disorders',
            number: 5,
            total: 5,
            label: 'Dermatological disorders'
          }
        ]);
        getMockedFindDistinctValuesByFilterId(['Ciliopathies', 'Dermatological disorders']);
        const response = await IndividualComparisonService.getComparisonByFieldAndGene(filterId, gene);
        expect(response).toStrictEqual({
          total: 2,
          fieldId: filter,
          existingValues: {
            Ciliopathies: 1,
            'Dermatological disorders': 5
          },
          notExistingValues: {}
        });
      });

      test('When values have only zero count, the existingValues should be empty', async () => {
        getMockedFindByFilterId(filter);
        getMockedGetParticipantsByGene(['1', '2']);
        getMockedGetFilterDataQuery([
          {
            _id: 'Ciliopathies',
            number: 0,
            total: 0,
            label: 'Ciliopathies'
          },
          {
            _id: 'Dermatological disorders',
            number: 0,
            total: 0,
            label: 'Dermatological disorders'
          }
        ]);
        getMockedFindDistinctValuesByFilterId(['Ciliopathies', 'Dermatological disorders']);
        const response = await IndividualComparisonService.getComparisonByFieldAndGene(filterId, gene);
        expect(response).toStrictEqual({
          total: 2,
          fieldId: filter,
          notExistingValues: {
            Ciliopathies: 0,
            'Dermatological disorders': 0
          },
          existingValues: {}
        });
      });
    });
  });

  describe('removeComparisonFilterToThePatient', () => {
    test('When patient workgroup is undefined, should return error', async () => {
      getMockedFindByFilterId(filter);
      expect(
        IndividualComparisonService.removeComparisonFilterToThePatient(
          1,
          (undefined as unknown) as PatientWorkgroup.Document
        )
      ).rejects.toThrowError(ResourceNotFoundError);
    });

    test('When field id is not valid, should return error', async () => {
      getMockedFindByFilterId(undefined);
      expect(IndividualComparisonService.removeComparisonFilterToThePatient(1, patientWorkgroup)).rejects.toThrowError(
        ResourceNotFoundError
      );
    });

    test('When field id is valid, should be removed from the comparison filters', async () => {
      getMockedFindByFilterId(filter);
      patientWorkgroup.comparisonFilters = [filter._id];
      const response = await IndividualComparisonService.removeComparisonFilterToThePatient(
        filter.id,
        patientWorkgroup
      );
      expect(response.comparisonFilters).toStrictEqual([]);
    });

    test('When field dont exist to the list, no changed', async () => {
      getMockedFindByFilterId(filter);
      patientWorkgroup.comparisonFilters = ['otherId'];
      const response = await IndividualComparisonService.removeComparisonFilterToThePatient(
        filter.id,
        patientWorkgroup
      );
      expect(response.comparisonFilters).toStrictEqual(['otherId']);
    });
  });

  describe('getGenoTiersRepositoryDistribution', () => {
    test('When property is genotype', async () => {
      const mock = getMockedGenoTiersRepositoryAggregation([]);
      await IndividualComparisonService.getGenotierDistribution(variant, ['A'], VariantComparisonProperty.Genotype);
      expect(mock).toBeCalledWith([
        {
          $match: {
            i: { $in: ['A'] },
            fullLocation: variant,
            genotype: { $exists: true }
          }
        },
        { $group: { _id: '$genotype', number: { $sum: 1 } } },
        { $sort: { number: -1 } }
      ]);
    });

    test('When property is acmgVerdict', async () => {
      const mock = getMockedGenoTiersRepositoryAggregation([]);
      await IndividualComparisonService.getGenotierDistribution(variant, ['A'], VariantComparisonProperty.AcmgVerdict);
      expect(mock).toBeCalledWith([
        {
          $match: {
            i: { $in: ['A'] },
            fullLocation: variant,
            acmgVerdict: { $exists: true }
          }
        },
        { $group: { _id: '$acmgVerdict', number: { $sum: 1 } } },
        { $sort: { number: -1 } }
      ]);
    });
  });

  describe('getComparisonGraphDataByVariant', () => {
    test('When only genotype data found', async () => {
      getMockedGenoTiersRepositoryAggregation([
        {
          _id: 'heterozygous',
          number: 8
        },
        {
          _id: 'homozygous',
          number: 1
        }
      ]);
      getMockedGenoTiersRepositoryAggregation([]);
      const response = await IndividualComparisonService.getComparisonGraphDataByVariant(variant);
      expect(response).toStrictEqual({
        genotypes: {
          heterozygous: 8,
          homozygous: 1
        },
        acmgVerdicts: {}
      });
    });

    test('When only acmgVerdict data found', async () => {
      getMockedGenoTiersRepositoryAggregation([]);
      getMockedGenoTiersRepositoryAggregation([
        {
          _id: 'Pathogenic',
          number: 3
        },
        {
          _id: 'Likely Pathogenic',
          number: 2
        },
        {
          _id: 'Likely Benign',
          number: 1
        }
      ]);
      const response = await IndividualComparisonService.getComparisonGraphDataByVariant(variant);
      expect(response).toStrictEqual({
        genotypes: {},
        acmgVerdicts: {
          Pathogenic: 3,
          'Likely Pathogenic': 2,
          'Likely Benign': 1
        }
      });
    });

    test('When both data found', async () => {
      getMockedGenoTiersRepositoryAggregation([
        {
          _id: 'heterozygous',
          number: 8
        },
        {
          _id: 'homozygous',
          number: 1
        }
      ]);
      getMockedGenoTiersRepositoryAggregation([
        {
          _id: 'Pathogenic',
          number: 3
        },
        {
          _id: 'Likely Pathogenic',
          number: 2
        },
        {
          _id: 'Likely Benign',
          number: 1
        }
      ]);
      const response = await IndividualComparisonService.getComparisonGraphDataByVariant(variant);
      expect(response).toStrictEqual({
        genotypes: {
          heterozygous: 8,
          homozygous: 1
        },
        acmgVerdicts: {
          Pathogenic: 3,
          'Likely Pathogenic': 2,
          'Likely Benign': 1
        }
      });
    });
  });
});
