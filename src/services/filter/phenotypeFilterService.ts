import { PhenotypeFieldValueTypes, PhenotypeQueryType } from '@core/enums';
import { MedicalValueRepository, PhenotypeFieldRepository, PhenotypeNestedListRepository } from '@core/repos';
import { NumberUtils, PhenotypeFieldUtils, ValidationUtils } from 'utils';
import { log as logger } from 'services/log';
import { isEmpty } from 'lodash';
import config from 'config';

export class PhenotypeFiltersService {
  /**
   * Returns the filter values for participant.
   * @param eid the eid
   * @param filterId  the filter id
   * @param instances the instances
   * @param arrays  the arrays
   */
  public static async getFilterValuesForParticipant(
    eid: string,
    filterId: Filter.FilterId,
    instances: Array<string>,
    arrays?: Array<string>
  ): Promise<string> {
    const filter = await PhenotypeFieldRepository.findByFilterId(filterId);
    const criteria = PhenotypeFieldUtils.getCriteriaForParticipantValues(eid, instances, arrays);
    const results: Array<PhenotypeValue.Attributes> = await PhenotypeFieldRepository.findByCriteria(filterId, criteria);
    const values = (results || []).reduce<Filter.FilterValue[]>((acc, current) => {
      if (current !== undefined && current.v !== undefined) {
        acc.push(PhenotypeFieldUtils.findLabel(current.v, filter.values));
      }
      return acc;
    }, []);
    if (ValidationUtils.isArrayEmpty(values)) {
      return '-';
    }
    return values.join('; ');
  }

  /**
   * Returns the filter data by executing the query.
   * @param query the query
   */
  static async getFilterDataQuery(query: Filter.DataQuery): Promise<Filter.DataResult[]> {
    // First do the query
    const results = await PhenotypeFiltersService.executeFilterDataQuery(query);
    if (query.dontTransformData) {
      return results;
    }
    // Transform the results
    return PhenotypeFiltersService.executeTransformFilterData(query.filter, results);
  }

  /**
   * Returns the filter data by executing the query.
   *
   * @param query the query
   * @returns Promise<FilterAggregateResult[]>
   */
  public static async executeFilterDataQuery(query: Filter.DataQuery): Promise<Filter.FilterAggregateResult[]> {
    const { instances, participantIds, pagination, term, filter } = query;
    // By getting the type of query, we execute differently the query.
    const typeOfQuery = PhenotypeFieldUtils.getTypeOfQuery(filter);
    if (PhenotypeQueryType.TEXT_SEARCH === typeOfQuery) {
      const searchTerm = PhenotypeFiltersService.translateSearchTerm(query);
      // In text search query, we add the details with the pagination
      return PhenotypeFieldRepository.findAggregationDataForTermWithPagination(
        filter.id,
        instances as string[],
        pagination ? pagination.pageSize : undefined,
        pagination ? pagination.pageNumber : undefined,
        participantIds,
        searchTerm
      );
    } else if (PhenotypeQueryType.BUCKET === typeOfQuery) {
      // First find the boundaries and then do the query. This is because we have a lot of distinct data and should be
      // grouped, otherwise FE will display a lot of values of 1
      const boundaries =
        query.buckets || (await PhenotypeFiltersService.getBoundariesForFilter(filter, instances as string[]));
      if (!boundaries || boundaries.length < 1) {
        return [];
      } else if (boundaries.length === 1) {
        return PhenotypeFieldRepository.findAggregationData(filter.id, [], instances, participantIds);
      }
      return PhenotypeFieldRepository.findAggregationForBoundary(
        boundaries,
        filter.id,
        instances as string[],
        participantIds as string[]
      );
    } else if (PhenotypeQueryType.MEDICAL === typeOfQuery) {
      // For medical records, first we need to search to a different collection for the values and the ask for the exact
      // values the filter collection. This is for optimization reasons, because if we do directly the query then the
      // performance is poor.
      const values = await MedicalValueRepository.searchByTerm(filter.id, term);

      if (ValidationUtils.isArrayEmpty(values) || isEmpty(term) || (term as string).length < 2) {
        return [];
      }

      const primitiveValues = values.map((it) => it.v);
      return PhenotypeFieldRepository.findAggregationData(
        filter.id,
        instances as string[],
        participantIds,
        primitiveValues
      );
    } else {
      return PhenotypeFieldRepository.findAggregationData(filter.id, instances as string[], participantIds);
    }
  }

  /**
   * Returns the translated key matches when the query.term has translations, else the query.term
   * @param query the query
   */
  static translateSearchTerm(query: Filter.DataQuery): string | Array<string | number> | undefined {
    const { filter, term } = query;
    const { values } = filter as { values: Record<string, string> };
    const translationKeys = Object.keys(values || {});
    let matchedKeys: any[] = [];
    const hasTranslations = !!translationKeys.length;
    logger.debug(`translateSearchTerm filter ${filter.type} ${filter.id} hasTranslations ${hasTranslations}`);
    if (term && hasTranslations) {
      const normalize = (val: string): string => val.trim().toLocaleLowerCase();
      const termRegex = new RegExp(normalize(term));
      matchedKeys = translationKeys.reduce((matches: Array<string | number>, key: string) => {
        if (normalize(values[key] as string).match(termRegex)) {
          const keyToNum = Number(key);
          matches.push(Number.isNaN(keyToNum) ? key : keyToNum);
        }
        return matches;
      }, []);
    }
    return matchedKeys.length ? matchedKeys : term;
  }

  /**
   * Returns the boundaries for the field.
   * @param field the field
   * @param instances the instances
   */
  public static async getBoundariesForFilter(
    field: PhenotypeField.Attributes,
    instances: string[]
  ): Promise<Filter.FilterValue[] | undefined> {
    /**
     * The reason we pass empty participant ids, is that need to keep the same value range (min/max) even the user
     * has select an additional filter. So for example if the original filter values are:
     * min: 1, max: 10 [1, 10]
     * and user specifies an other filter that reduce the data to [4, 6], we still need to present buckets
     * between [1, 10], otherwise FE is not able to display correctly the filter data.
     * For more information check:
     * https://lifebit.atlassian.net/browse/DS-1086 and
     * https://lifebit-biotech.slack.com/archives/CR38K7S2V/p1636111513057000
     */
    const min = await PhenotypeFieldRepository.findMin(field.id, instances);
    const max = await PhenotypeFieldRepository.findMax(field.id, instances);
    if (min === undefined || max === undefined) {
      return [];
    }
    if (min === max) {
      return [min];
    }
    if (field.valueType === PhenotypeFieldValueTypes.Date || field.valueType === PhenotypeFieldValueTypes.Time) {
      return PhenotypeFieldUtils.getBoundariesForDate(min as string, max as string);
    } else {
      return PhenotypeFieldUtils.getBoundariesForNumber(min as number, max as number);
    }
  }

  /**
   * Returns the filter data by executing the query.
   * @param field the field
   * @param results the results
   */
  public static async executeTransformFilterData(
    field: PhenotypeField.Attributes,
    results: Filter.FilterAggregateResult[]
  ): Promise<Filter.DataResult[]> {
    // Set the totals to every item (to help FE)
    const total = PhenotypeFieldUtils.findTotalFromResults(results);
    results.map((it) => (it.total = total));
    // In case of the nested list, we need to do totally different things.
    if (PhenotypeFieldUtils.isNestedList(field)) {
      return PhenotypeFiltersService.executeTransformFilterDataForNestedList(field, results);
    } else {
      return PhenotypeFiltersService.executeTransformFilterDataForNormalCase(field, results);
    }
  }

  /**
   * Executes the transformation of the filter data for nested list.
   * @param field the field
   * @param results the results
   */
  public static async executeTransformFilterDataForNestedList(
    field: PhenotypeField.Attributes,
    results: Filter.FilterAggregateResult[]
  ): Promise<Filter.FilterDataResult[]> {
    const { coding } = field;
    // Find the tree in database.
    const dbTree = await PhenotypeNestedListRepository.findByCoding(coding);
    // Prepare the response for the client (for example custom fields)
    const tree = PhenotypeFieldUtils.preparePhenotypeTree(dbTree);
    // Set the values founded from the previous steps to the tree nodes. For example if you find the count 25 for the
    // value 'AART' inside the tree you need to code to that node and set the value, since you have two different
    // collections that keep the values: zpv_f, lpv_c the first is the values and the second the tree (translation).
    // Calculate the totals
    const total = results.reduce((a, b) => a + b.number, 0);
    // Set total to the tree nodes
    PhenotypeFieldUtils.setTotalToTheTree(tree, total);
    // Assign values to the tree
    PhenotypeFieldUtils.setValuesToTheTree(tree, results);
    // Set the total value to each node taking into account the children.
    PhenotypeFieldUtils.setCountToTheTree(tree);
    // Return the tree
    if (config.phenotypeNestedListReturnFlat) {
      return (PhenotypeFieldUtils.transformToMap(tree) as unknown) as Filter.FilterDataResult[];
    }
    return tree;
  }

  /**
   * Execute the transformation of the filter data for normal case.
   * @param field the field
   * @param results the results
   */
  public static async executeTransformFilterDataForNormalCase(
    field: PhenotypeField.Attributes,
    results: Filter.FilterAggregateResult[]
  ): Promise<Filter.FilterDataResult[]> {
    // In case the field has values, that means that the values need to be transformed
    if (field.values) {
      results.forEach((it) => {
        it.label = PhenotypeFieldUtils.findLabel(it._id, field.values) as string;
      });
    }

    // In every case except bucket sort the results
    if (!PhenotypeFieldUtils.isBucketSearch(field)) {
      if (PhenotypeFieldUtils.needToTransformStringToNumber(field, config.featureFlags)) {
        PhenotypeFieldUtils.sortStringResultsAsNumbers(results);
      } else {
        results.forEach((it) => {
          it._id = NumberUtils.castToNumberIfPossible(it._id);
        });
        PhenotypeFieldUtils.sortResultsAsNumbers(results);
      }
    }

    return results;
  }
}
