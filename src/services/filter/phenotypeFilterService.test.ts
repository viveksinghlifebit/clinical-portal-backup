import { PhenotypeFieldTypes } from '@core/enums';
import { PhenotypeFieldRepository } from '@core/repos';
import { PhenotypeTestFieldBuilder, PhenotypeValueBuilder } from 'testUtils';
import { PhenotypeFiltersService } from './phenotypeFilterService';

describe('PhenotypeFilterService', () => {
  describe('getFilterValuesForParticipant', () => {
    const mockedPhenotype: PhenotypeField.Attributes = new PhenotypeTestFieldBuilder()
      .withId(8)
      .instancesSize(0)
      .arraySize(0)
      .withValues({ '0': 'Male', '1': 'Female' })
      .ofType(PhenotypeFieldTypes.Bars)
      .build();

    const mockedPhenotypeNoLabels: PhenotypeField.Attributes = new PhenotypeTestFieldBuilder()
      .withId(8)
      .instancesSize(0)
      .arraySize(0)
      .ofType(PhenotypeFieldTypes.Bars)
      .build();

    const mockedValue1: PhenotypeValue.Attributes = new PhenotypeValueBuilder()
      .withEid('10001')
      .withArray('0')
      .withInstance('0')
      .withValue('0')
      .build();

    const mockedValue2: PhenotypeValue.Attributes = new PhenotypeValueBuilder()
      .withEid('10001')
      .withArray('0')
      .withInstance('0')
      .withValue('1')
      .build();

    let findByFilterIdSpy: jest.SpyInstance;
    let findByCriteriaSpy: jest.SpyInstance;

    beforeAll(() => {
      findByFilterIdSpy = jest.spyOn(PhenotypeFieldRepository, 'findByFilterId');
      findByCriteriaSpy = jest.spyOn(PhenotypeFieldRepository, 'findByCriteria');
    });

    test('When filter has data', async () => {
      findByFilterIdSpy.mockReturnValueOnce(mockedPhenotype);
      findByCriteriaSpy.mockReturnValueOnce([mockedValue1, mockedValue2]);

      const filterValues = await PhenotypeFiltersService.getFilterValuesForParticipant('10001', 8, ['0'], ['1']);

      expect(filterValues).toEqual('Male; Female');
    });

    test('When filter has no data', async () => {
      findByFilterIdSpy.mockReturnValueOnce(mockedPhenotype);
      findByCriteriaSpy.mockReturnValueOnce([]);
      const filterValues = await PhenotypeFiltersService.getFilterValuesForParticipant('10001', 8, ['0'], ['1']);

      expect(filterValues).toEqual('-');
    });
    test('When filter has no data undefined', async () => {
      findByFilterIdSpy.mockReturnValueOnce(mockedPhenotype);
      findByCriteriaSpy.mockReturnValueOnce(undefined);
      const filterValues = await PhenotypeFiltersService.getFilterValuesForParticipant('10001', 8, ['0'], ['1']);

      expect(filterValues).toEqual('-');
    });

    test('When filter has data - but no labels', async () => {
      findByFilterIdSpy.mockReturnValueOnce(mockedPhenotypeNoLabels);
      findByCriteriaSpy.mockReturnValueOnce([mockedValue1, mockedValue2]);

      const filterValues = await PhenotypeFiltersService.getFilterValuesForParticipant('10001', 8, ['0'], ['1']);

      expect(filterValues).toEqual('0; 1');
    });
  });
});
