import { PhenotypeFieldUtils } from './phenotypeFieldUtils';
import { PhenotypeNestedListResponseBuilder, PhenotypeTestFieldBuilder } from 'testUtils';
import { PhenotypeFieldTypes, PhenotypeQueryType } from 'enums';

describe('Phenotype Field Utils test suite', () => {
  describe('Phenotype Field Utils: Testing TextSearch()', () => {
    test('when a field is actually a text search', (done) => {
      expect(
        PhenotypeFieldUtils.isTextSearch(new PhenotypeTestFieldBuilder().ofType(PhenotypeFieldTypes.TextSearch).build())
      ).toBeTruthy();
      done();
    });
    test('when a field is not a text search', (done) => {
      expect(
        PhenotypeFieldUtils.isTextSearch(new PhenotypeTestFieldBuilder().ofType(PhenotypeFieldTypes.NestedList).build())
      ).toBeFalsy();
      done();
    });
  });

  describe('Phenotype Field Utils: Testing isBucketSearch()', () => {
    test('when a field is actually a bucket search', (done) => {
      expect(
        PhenotypeFieldUtils.isBucketSearch(
          new PhenotypeTestFieldBuilder().withBucket300(true).ofType(PhenotypeFieldTypes.Histogram).build()
        )
      ).toBeTruthy();
      done();
    });
    test('when a field is a bucket search, but the wrong type', (done) => {
      expect(PhenotypeFieldUtils.isTextSearch(new PhenotypeTestFieldBuilder().withBucket300(true).build())).toBeFalsy();
      done();
    });
    test('when a field is not a bucket search', (done) => {
      expect(
        PhenotypeFieldUtils.isTextSearch(new PhenotypeTestFieldBuilder().withBucket300(false).build())
      ).toBeFalsy();
      done();
    });
  });

  describe('Phenotype Field Utils: Testing isMedicalRecord()', () => {
    test('when a field is a medical record', (done) => {
      expect(
        PhenotypeFieldUtils.isMedicalRecord(new PhenotypeTestFieldBuilder().withDescriptionItemType('Medical').build())
      ).toBeTruthy();
      done();
    });
    test('when a field is not a medical record', (done) => {
      expect(
        PhenotypeFieldUtils.isMedicalRecord(
          new PhenotypeTestFieldBuilder().withDescriptionItemType('NOT a Medical').build()
        )
      ).toBeFalsy();
      done();
    });
  });

  describe('Phenotype Field Utils: Testing getBoundariesForDate()', () => {
    test('when a field is normal the size should be 50', (done) => {
      expect(
        PhenotypeFieldUtils.getBoundariesForDate('2020-01-01T00:00:00.000Z', '2020-12-31T14:48:00.000Z')?.length
      ).toBeGreaterThan(50);
      done();
    });

    test('when a field has less than 50 values, should return the difference', () => {
      const results = PhenotypeFieldUtils.getBoundariesForDate('2020-01-01', '2020-01-31')?.length;
      expect(results).toBeLessThan(50);
    });
  });

  describe('Phenotype Field Utils: Testing getBoundariesForNumber()', () => {
    test('when a field is normal the size should be 50', () => {
      expect(PhenotypeFieldUtils.getBoundariesForNumber(1, 50)?.length).toBeGreaterThan(50);
    });

    test('when a field has less than 50, should return 50 values again', () => {
      expect(PhenotypeFieldUtils.getBoundariesForNumber(0.1, 0.2)?.length).toBeGreaterThan(50);
    });

    test('boundaries are sorted in a strictly ascending order', () => {
      const boundaries: number[] = PhenotypeFieldUtils.getBoundariesForNumber(0.1, 0.2) as number[];
      const areBoundariesSortedStrictlyAsc = boundaries?.every((currentBoundary, currentBoundaryIndex) =>
        currentBoundaryIndex === 0 ? true : currentBoundary > boundaries[currentBoundaryIndex - 1]!
      );
      expect(areBoundariesSortedStrictlyAsc).toBe(true);
    });
  });

  describe('Phenotype Field Utils: Testing getTypeOfQuery()', () => {
    test('when the type of query is bucket', (done) => {
      expect(
        PhenotypeFieldUtils.getTypeOfQuery(
          new PhenotypeTestFieldBuilder().withBucket300(true).ofType(PhenotypeFieldTypes.Histogram).build()
        )
      ).toStrictEqual(PhenotypeQueryType.BUCKET);
      done();
    });
    test('when the type of query is text search', (done) => {
      expect(
        PhenotypeFieldUtils.getTypeOfQuery(
          new PhenotypeTestFieldBuilder().ofType(PhenotypeFieldTypes.TextSearch).build()
        )
      ).toStrictEqual(PhenotypeQueryType.TEXT_SEARCH);
      done();
    });
    test('when the type of query is medical', (done) => {
      expect(
        PhenotypeFieldUtils.getTypeOfQuery(new PhenotypeTestFieldBuilder().withDescriptionItemType('Medical').build())
      ).toStrictEqual(PhenotypeQueryType.MEDICAL);
      done();
    });
    test('when the type of query is normal', (done) => {
      expect(PhenotypeFieldUtils.getTypeOfQuery(new PhenotypeTestFieldBuilder().build())).toStrictEqual(
        PhenotypeQueryType.NORMAL
      );
      done();
    });
  });

  describe('Phenotype Field Utils: Testing findTotalFromResults()', () => {
    test('when the results is single item', (done) => {
      expect(
        PhenotypeFieldUtils.findTotalFromResults([{ _id: '1', number: 5, total: 5, label: undefined }])
      ).toStrictEqual(5);
      done();
    });
    test('when the results has 2 items', (done) => {
      expect(
        PhenotypeFieldUtils.findTotalFromResults([
          { _id: '1', number: 5, total: 5, label: undefined },
          {
            _id: '2',
            number: 2,
            total: 5,
            label: undefined
          }
        ])
      ).toStrictEqual(7);
      done();
    });
    test('when the results has no items', (done) => {
      expect(PhenotypeFieldUtils.findTotalFromResults([])).toStrictEqual(0);
      done();
    });
  });

  describe('Phenotype Field Utils: Testing isNestedList()', () => {
    test('when it is a nested list', (done) => {
      expect(
        PhenotypeFieldUtils.isNestedList(new PhenotypeTestFieldBuilder().ofType(PhenotypeFieldTypes.NestedList).build())
      ).toBeTruthy();
      done();
    });
    test('when it isnt a nested list', (done) => {
      expect(
        PhenotypeFieldUtils.isNestedList(new PhenotypeTestFieldBuilder().ofType(PhenotypeFieldTypes.Bars).build())
      ).toBeFalsy();
      done();
    });
  });

  describe('Phenotype Field Utils: Testing findTreeNodeByCode()', () => {
    const childOneWithOne = new PhenotypeNestedListResponseBuilder()
      .withNodeId('AAA1_1')
      .withCoding('AAA1_1')
      .withNodeId('AAA1_1')
      .build();

    const child1 = new PhenotypeNestedListResponseBuilder()
      .withNodeId('AAA1')
      .withCoding('AAA1')
      .withNodeId('AAA1')
      .withChildren([childOneWithOne])
      .build();

    const child2 = new PhenotypeNestedListResponseBuilder()
      .withNodeId('AAA2')
      .withCoding('AAA2')
      .withNodeId('AAA2')
      .build();

    const tree = new PhenotypeNestedListResponseBuilder()
      .withNodeId('AAA')
      .withCoding('AAA')
      .withNodeId('AAA')
      .withChildren([child1, child2])
      .build();

    test('when node is inside the list (level 2)', (done) => {
      expect(PhenotypeFieldUtils.findTreeNodeByCode([tree], 'AAA1_1').nodeId).toStrictEqual('AAA1_1');
      done();
    });
    test('when node is inside the list (level 1)', (done) => {
      expect(PhenotypeFieldUtils.findTreeNodeByCode([tree], 'AAA1').nodeId).toStrictEqual('AAA1');
      done();
    });
    test('when node is a root (level 0)', (done) => {
      expect(PhenotypeFieldUtils.findTreeNodeByCode([tree], 'AAA').nodeId).toStrictEqual('AAA');
      done();
    });
    test('when node is not found', (done) => {
      expect(PhenotypeFieldUtils.findTreeNodeByCode([tree], 'XXX')).toBeUndefined();
      done();
    });
    test('when the tree is empty', (done) => {
      expect(PhenotypeFieldUtils.findTreeNodeByCode([], 'XXX')).toBeUndefined();
      done();
    });
    test('when the tree is undefined', (done) => {
      expect(PhenotypeFieldUtils.findTreeNodeByCode((undefined as unknown) as any[], 'XXX')).toBeUndefined();
      done();
    });
  });

  describe('Phenotype Field Utils: Testing setValuesToTheTree()', () => {
    const childOneWithOne = new PhenotypeNestedListResponseBuilder()
      .withNodeId('AAA1_1')
      .withCoding('AAA1_1')
      .withNodeId('AAA1_1')
      .build();

    const child1 = new PhenotypeNestedListResponseBuilder()
      .withNodeId('AAA1')
      .withCoding('AAA1')
      .withNodeId('AAA1')
      .withChildren([childOneWithOne])
      .build();

    const child2 = new PhenotypeNestedListResponseBuilder()
      .withNodeId('AAA2')
      .withCoding('AAA2')
      .withNodeId('AAA2')
      .build();

    const tree = new PhenotypeNestedListResponseBuilder()
      .withNodeId('AAA')
      .withCoding('AAA')
      .withNodeId('AAA')
      .withChildren([child1, child2])
      .build();

    const values: Filter.FilterAggregateResult[] = [
      {
        _id: 'AAA1',
        number: 1,
        total: 0,
        label: undefined
      },
      {
        _id: 'AAA2',
        number: 2,
        total: 0,
        label: undefined
      }
    ];
    PhenotypeFieldUtils.setValuesToTheTree([tree], values);
    test('when value exists in the tree', (done) => {
      expect(PhenotypeFieldUtils.findTreeNodeByCode([tree], 'AAA1').count).toStrictEqual(1);
      done();
    });
    test('when value exists in the tree no2', (done) => {
      expect(PhenotypeFieldUtils.findTreeNodeByCode([tree], 'AAA2').count).toStrictEqual(2);
      done();
    });
  });

  describe('Phenotype Field Utils: Testing findLabel()', () => {
    const labels = {
      AA22C: 'AA22C;Cerebrovascular Accident',
      AA22D: 'AA22D;Cerebrovascular Accident'
    };
    test('when value exists in labels', (done) => {
      expect(PhenotypeFieldUtils.findLabel('AA22C', labels)).toStrictEqual('AA22C;Cerebrovascular Accident');
      expect(PhenotypeFieldUtils.findLabel('AA22D', labels)).toStrictEqual('AA22D;Cerebrovascular Accident');
      done();
    });
    test('when value not exists labels', (done) => {
      expect(PhenotypeFieldUtils.findLabel('AA22E', labels)).toStrictEqual('AA22E');
      done();
    });
  });

  describe('Phenotype Field Utils: Testing sortResults()', () => {
    const results: Filter.FilterAggregateResult[] = [
      {
        _id: 10,
        number: 5,
        total: 15,
        label: '1'
      },
      {
        _id: 5,
        number: 5,
        total: 15,
        label: '2'
      },
      {
        _id: 7,
        number: 5,
        total: 15,
        label: '3'
      }
    ];
    test('when value as mixed', (done) => {
      PhenotypeFieldUtils.sortResultsAsNumbers(results);
      expect(results[0]?.label).toStrictEqual('2');
      expect(results[1]?.label).toStrictEqual('3');
      expect(results[2]?.label).toStrictEqual('1');
      done();
    });
  });

  describe('Phenotype Field Utils: Testing hasSingleArray()', () => {
    test('when the field is single', (done) => {
      expect(PhenotypeFieldUtils.hasSingleArray(new PhenotypeTestFieldBuilder().arraySize(1).build())).toBeTruthy();
      done();
    });
    test('when the field is not a single', (done) => {
      expect(PhenotypeFieldUtils.hasSingleArray(new PhenotypeTestFieldBuilder().arraySize(2).build())).toBeFalsy();
      done();
    });
  });

  describe('Phenotype Field Utils: Testing getCriteriaForParticipantValues()', () => {
    test('when all data are provided', (done) => {
      const criteria = PhenotypeFieldUtils.getCriteriaForParticipantValues('1111000', ['0'], ['0', '1']);
      expect(criteria['i']).toStrictEqual('1111000');
      expect(criteria['is']).toStrictEqual({ $in: ['0'] });
      expect(criteria['a']).toStrictEqual({ $in: ['0', '1'] });
      done();
    });
  });
});

describe('Phenotype Field Utils: Testing findLabelContains()', () => {
  const labels = {
    '0': 'Female',
    '1': 'Male'
  };
  test('when value exists in labels', (done) => {
    expect(PhenotypeFieldUtils.findValuesContainingFromLabels('fem', labels)).toStrictEqual(['0']);
    done();
  });
  test('when value exists in labels and match with more than one values', (done) => {
    expect(PhenotypeFieldUtils.findValuesContainingFromLabels('male', labels)).toStrictEqual(['0', '1']);
    done();
  });
});

describe('Phenotype Field Utils: Testing getCriteria', () => {
  const getPartialTestFilterQuery = () => ({
    isLabel: true,
    instance: ['0'],
    field: 4
  });
  const getTestFilterNumericQuery = () =>
    Object.assign(getPartialTestFilterQuery(), {
      value: [1, 2]
    });
  const getTestFilterTextQuery = () =>
    Object.assign(getPartialTestFilterQuery(), {
      value: ['female', 'male']
    });
  const getExpectedRegexQuery = () => ({ $regex: '^female|^male', $options: 'i' });

  describe('Phenotype Field Utils: Testing getCriteriaForQuery()', () => {
    test('when searching for text terms, returns case insensitive regex criteria', () => {
      const filterTextQuery = getTestFilterTextQuery();
      expect(PhenotypeFieldUtils.getCriteriaForQuery(filterTextQuery)).toStrictEqual({ v: getExpectedRegexQuery() });
    });
    test('when searching for numerical terms, returns $in: [...] criteria', () => {
      const filterNumericQuery = getTestFilterNumericQuery();
      expect(PhenotypeFieldUtils.getCriteriaForQuery(filterNumericQuery)).toStrictEqual({
        v: { $in: filterNumericQuery.value }
      });
    });
  });

  describe('Phenotype Field Utils: Testing getCriteriaForNegativeQuery()', () => {
    test('when searching for text terms, returns a negated case insensitive regex criteria', () => {
      const filterTextQuery = getTestFilterTextQuery();
      expect(PhenotypeFieldUtils.getCriteriaForNegativeQuery(filterTextQuery)).toStrictEqual({
        v: { $not: getExpectedRegexQuery() }
      });
    });
    test('when searching for numerical terms, returns $nin: [...] criteria', () => {
      const filterNumericQuery = getTestFilterNumericQuery();
      expect(PhenotypeFieldUtils.getCriteriaForNegativeQuery(filterNumericQuery)).toStrictEqual({
        v: { $nin: filterNumericQuery.value }
      });
    });
  });
});
