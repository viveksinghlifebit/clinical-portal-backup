import { PhenotypeFieldTypes, PhenotypeQueryType } from '@core/enums';
import { compact, isEmpty, uniq } from 'lodash';
import { ValidationUtils } from './validationUtils';

const isTextFilterQueryValue = (value: Filter.FilterQueryValueExact): boolean => typeof value[0] === 'string';
const getRegexQuery = (value: Filter.FilterQueryValueExact): Record<string, string> => ({
  $regex: `^${value.join('|^')}`,
  $options: 'i'
});
export class PhenotypeFieldUtils {
  /**
   * Prepares the phenotype tree for the nested list.
   * @param sourceTree  the original tree
   */
  static preparePhenotypeTree(sourceTree: PhenotypeNestedList.Attributes[]): Filter.PhenotypeNestedListResponse[] {
    return sourceTree.map((it) => this.createPhenotypeTree(it));
  }

  /**
   * Creates a phenotype tree by the source.
   * @param source  the source
   */
  static createPhenotypeTree(source: PhenotypeNestedList.Attributes): Filter.PhenotypeNestedListResponse {
    const target: Filter.PhenotypeNestedListResponse = {
      count: 0,
      nodeId: undefined,
      parentId: undefined,
      total: 0,
      coding: source.coding,
      label: source.meaning,
      selectable: source.selectable,
      children: []
    };
    if (source.children) {
      const children = source.children as PhenotypeNestedList.Attributes[];
      children.forEach((it) => {
        target.children.push(this.createPhenotypeTree(it));
      });
    }
    return target;
  }

  /**
   * Set the totals to the tree.
   *
   * @param tree  the tree
   * @param total the total
   */
  static setTotalToTheTree(tree: Filter.PhenotypeNestedListResponse[], total: number): void {
    tree.forEach((node) => {
      node.total = total;
      const children = node.children as Filter.PhenotypeNestedListResponse[];
      this.setTotalToTheTree(children, total);
    });
  }

  /**
   * Set the count to the tree.
   *
   * @param tree  the tree
   */
  static setCountToTheTree(tree: Filter.PhenotypeNestedListResponse[]): void {
    tree.forEach((item) => {
      this.setCountToTheTreeNode(item);
    });
  }

  /**
   * Set the count to the tree node.
   * @param node the node
   */
  static setCountToTheTreeNode(node: Filter.PhenotypeNestedListResponse): number {
    const children = node.children as Filter.PhenotypeNestedListResponse[];
    const childrenCount = children.reduce((prev, curr) => prev + this.setCountToTheTreeNode(curr), 0);
    node.count += childrenCount;
    return node.count;
  }

  /**
   * Set the values to the tree.
   *
   * @param tree  the tree
   * @param values  the values
   */
  static setValuesToTheTree(tree: Filter.PhenotypeNestedListResponse[], values: Filter.FilterAggregateResult[]): void {
    values.forEach((value) => {
      const code = value._id;
      const node = this.findTreeNodeByCode(tree, code);
      if (node) {
        node.count = (node.count || 0) + value.number;
      }
    });
  }

  /**
   * Finds the node in the tree using the code provided.
   * @param tree  the tree
   * @param code  the code
   * @private
   */
  public static findTreeNodeByCode(
    tree: Filter.PhenotypeNestedListResponse[],
    code: string | number
  ): Filter.PhenotypeNestedListResponse | undefined {
    if (!tree) {
      return undefined;
    }
    let founded;
    tree.forEach((node) => {
      if (node.coding === (code as string)) {
        founded = node;
      } else {
        const children = node.children as Filter.PhenotypeNestedListResponse[];
        const response = this.findTreeNodeByCode(children, code);
        if (response) {
          founded = response;
        }
      }
    });
    return founded;
  }

  /**
   * Returns if the filed is a nested list.
   * @param field the field
   */
  public static isNestedList(field: PhenotypeField.Attributes): boolean {
    return field.type === PhenotypeFieldTypes.NestedList;
  }

  /**
   * Returns the total for the results
   * @param results the results
   */
  public static findTotalFromResults(results: Filter.FilterAggregateResult[]): number {
    if (ValidationUtils.isArrayEmpty(results)) {
      return 0;
    }
    return results.reduce((a, b) => a + (b.number || 0), 0);
  }

  public static findLabel(value: Filter.FilterValue, labels?: Record<string, string>): Filter.FilterValue {
    return labels?.[value] ?? value;
  }

  /**
   * Returns the criteria for participant values
   * @param eid the eid
   * @param filterId  the filter id
   * @param instances the instances
   * @param arrays  the arrays
   */
  public static getCriteriaForParticipantValues(
    eid: string,
    instances: Array<string>,
    arrays?: Array<string>
  ): Record<string, unknown> {
    const criteria = { i: eid } as Record<string, unknown>;
    if (instances) {
      criteria['is'] = { $in: instances };
    }
    if (arrays) {
      criteria['a'] = { $in: arrays };
    }
    return criteria;
  }

  /**
   * Returns the query type by examining the phenotype.
   * @param field the field
   */
  public static getTypeOfQuery(field: PhenotypeField.Attributes): PhenotypeQueryType {
    if (PhenotypeFieldUtils.isTextSearch(field)) {
      return PhenotypeQueryType.TEXT_SEARCH;
    } else if (PhenotypeFieldUtils.isBucketSearch(field) && !PhenotypeFieldUtils.isMedicalRecord(field)) {
      return PhenotypeQueryType.BUCKET;
    } else if (PhenotypeFieldUtils.isMedicalRecord(field)) {
      return PhenotypeQueryType.MEDICAL;
    } else {
      return PhenotypeQueryType.NORMAL;
    }
  }

  /**
   * Returns if the field is a text search
   * @param field the field
   */
  public static isTextSearch(field: PhenotypeField.Attributes): boolean {
    return field.type === PhenotypeFieldTypes.TextSearch;
  }

  /**
   * Returns if the field is a bucket search
   * @param field the field
   */
  public static isBucketSearch(field: PhenotypeField.Attributes): boolean {
    return field.type === PhenotypeFieldTypes.Histogram && (field.bucket300 || field.bucket500);
  }

  /**
   * Returns if the field is a medical
   * @param field the field
   */
  public static isMedicalRecord(field: PhenotypeField.Attributes): boolean {
    return field.descriptionItemType === 'Medical';
  }

  /**
   * Returns the boundaries for date.
   * @param min the min date
   * @param max the max date
   */
  public static getBoundariesForDate(min: string, max: string): string[] | undefined {
    if (isEmpty(min) || isEmpty(max)) {
      return undefined;
    }
    const boundaries = [];
    const startDate = new Date(min);
    startDate.setDate(startDate.getDate() - 1);
    const endDate = new Date(max);
    endDate.setDate(startDate.getDate() + 1);
    const differenceInMS = endDate.getTime() - startDate.getTime();
    const days = Math.floor(differenceInMS / (1000 * 3600 * 24));
    const step = Math.floor(days / Math.min(days, 50));

    // eslint-disable-next-line no-unmodified-loop-condition
    while (startDate < endDate) {
      boundaries.push(startDate.toISOString().split('T')[0]);
      startDate.setDate(startDate.getDate() + step);
    }
    boundaries.push(endDate.toISOString().split('T')[0]);
    return (uniq(boundaries) as string[]).sort();
  }

  /**
   * Returns the boundaries for date.
   * @param min the min date
   * @param max the max date
   */
  public static getBoundariesForNumber(min: number, max: number): number[] | undefined {
    if (isNaN(min) || isNaN(max)) {
      return undefined;
    }
    const boundaries = [];
    let newMin = min - 0.00001;
    const step = Math.abs(max - newMin) / 50;
    while (newMin < max) {
      boundaries.push(parseFloat(newMin.toFixed(7)));
      newMin = newMin + step;
    }
    boundaries.push(max + 0.00001);
    return boundaries;
  }

  /**
   * Set the count to the tree.
   *
   * @param tree  the tree
   */
  static transformToMap(
    tree: Filter.PhenotypeNestedListResponse[]
  ): Record<string, Filter.PhenotypeNestedListResponse> {
    this.assignParentToNodes(tree);
    const allNodes = this.getAllNodes(tree);
    return allNodes.reduce((acc, node) => {
      acc[node.coding] = node;
      if (node.children) {
        const children = node.children as Filter.PhenotypeNestedListResponse[];
        node.children = children.map((item) => item.coding);
      }
      return acc;
    }, {});
  }

  /**
   * Set the count to the tree.
   *
   * @param tree  the tree
   */
  static assignParentToNodes(tree: Filter.PhenotypeNestedListResponse[]): void {
    tree.forEach((node) => {
      if (node.children) {
        const children = node.children as Filter.PhenotypeNestedListResponse[];
        children.forEach((child) => {
          child.parentId = node.coding;
        });
        this.assignParentToNodes(children);
      }
    });
  }

  /**
   * Set the count to the tree.
   *
   * @param tree  the tree
   */
  static getAllNodes(tree: Filter.PhenotypeNestedListResponse[]): Filter.PhenotypeNestedListResponse[] {
    return tree.reduce((acc, node) => {
      acc.push(node);
      if (node.children) {
        acc.push(...this.getAllNodes(node.children as Filter.PhenotypeNestedListResponse[]));
      }
      return acc;
    }, []);
  }

  /**
   * Returns if the field's value need to be transformed to number.
   * @param field the field
   * @param featureFlags  the feature flags
   */
  public static needToTransformStringToNumber(
    field: PhenotypeField.Attributes,
    featureFlags: Record<string, unknown>
  ): boolean {
    return field.type !== PhenotypeFieldTypes.Bars || featureFlags.BARS_STRING_VALUES === false;
  }

  /**
   * Sort the string results
   * @param results the results
   */
  public static sortStringResultsAsNumbers(results: Filter.FilterAggregateResult[]): void {
    results.sort((item1, item2) => {
      return parseInt(item1._id as string) - parseInt(item2._id as string);
    });
  }

  /**
   * Sort the results
   * @param results the results
   */
  public static sortResultsAsNumbers(results: Filter.FilterAggregateResult[]): void {
    results.sort((item1, item2) => {
      return (item1._id as number) - (item2._id as number);
    });
  }

  /**
   * Returns the count of matched values
   * @param data the data
   * @param value  the value
   */
  public static getMatchedValues(data: Filter.FilterDataResult[], value: string | number): number {
    if (!data) {
      return 0;
    }
    const entry = data.find(
      (item) => item._id === value || (!isNaN(value as number) && item._id === parseInt(value as string))
    );
    if (entry) {
      return entry.number;
    }
    return 0;
  }

  /**
   * Returns if the field has single array.
   * @param field
   */
  public static hasSingleArray(field: PhenotypeField.Attributes): boolean {
    return field.array === 1;
  }

  /**
   * Finds the label by the value
   * @param value the value
   * @param labels  the labels
   */
  public static findValuesContainingFromLabels(
    value: Filter.FilterValue,
    labels: Record<string, string>
  ): Array<Filter.FilterValue> {
    if (!labels || !value) {
      return [value];
    }
    // First cast the value to string to be able to compare.
    const valueStr = value.toString().toLowerCase();
    // For each entry in the labels
    // { "0" : "Female", "1" : "Male" }
    const values = Object.entries(labels).flatMap((entry) => {
      // Check if the label value match with the value, for example "Female" contains "Fem"
      if (entry[1].toLowerCase().includes(valueStr)) {
        return entry[0];
      }
      return undefined;
    });
    const cleanValues = compact(values);
    if (ValidationUtils.isArrayEmpty(cleanValues)) {
      return [value];
    }
    return cleanValues;
  }

  /**
   * Return the criteria for negative query
   * @param query the query
   */
  public static getCriteriaForQuery(query: Filter.FilterQuery): Record<string, unknown> {
    if (!query.value) {
      return {};
    }
    const criteria: Record<string, unknown> = {};
    if (this.isInstanceOfFilterQueryValueRange(query.value)) {
      const rangeQuery = query.value as Filter.FilterQueryValueRange;
      const range: Record<string, unknown> = {};
      if (rangeQuery.from) range['$gte'] = rangeQuery.from;
      if (rangeQuery.to) range['$lte'] = rangeQuery.to;
      criteria['v'] = range;
    } else {
      const queryFilterValueExact = query.value as Filter.FilterQueryValueExact;
      criteria['v'] = isTextFilterQueryValue(queryFilterValueExact)
        ? getRegexQuery(queryFilterValueExact)
        : { $in: query.value };
    }
    return criteria;
  }

  /**
   * Returns if the item is an instance of filter query value range.
   * @param item the item
   */
  public static isInstanceOfFilterQueryValueRange(
    item: Filter.FilterQueryValueExact | Filter.FilterQueryValueRange
  ): boolean {
    if (item !== Object(item)) {
      return false;
    }
    return 'from' in item || 'to' in item;
  }

  /**
   * Return the criteria for negative query
   * @param query the query
   */
  public static getCriteriaForNegativeQuery(query: Filter.FilterQuery): Record<string, unknown> {
    if (!query.value) {
      return {};
    }
    const criteria: Record<string, unknown> = {};
    if (this.isInstanceOfFilterQueryValueRange(query.value)) {
      const rangeQuery = query.value as Filter.FilterQueryValueRange;
      criteria['$or'] = [{ v: { $gte: rangeQuery.to } }, { v: { $lte: rangeQuery.from } }];
    } else {
      const queryFilterValueExact = query.value as Filter.FilterQueryValueExact;
      criteria['v'] = isTextFilterQueryValue(queryFilterValueExact)
        ? { $not: getRegexQuery(queryFilterValueExact) }
        : { $nin: query.value };
    }
    return criteria;
  }
}
