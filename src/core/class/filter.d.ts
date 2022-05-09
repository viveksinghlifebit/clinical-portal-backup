declare namespace Filter {
  type FilterValue = string | number;
  type FilterId = PredefinedFilterId | UserDefinedFilterId;
  type PredefinedFilterId = number;
  type UserDefinedFilterId = string;
  type PhenotypeNestedListResponse = any;
  type DataResult = PhenotypeNestedListResponse | FilterAggregateResult;
  type FilterDataResult = PhenotypeNestedListResponse | FilterAggregateResult;

  interface FilterAggregateResult {
    _id: FilterValue;
    number: number;
    total: number;
    label?: string;
  }
  interface SearchItem {
    column?: FilterColumnType;
    columnHeader?: string;
    value?: string;
    values?: string[];
    contains?: string[];
    high?: number | string;
    low?: number | string;
  }

  interface FilterColumnType {
    id: FilterId;
    instance: string;
    array: ArrayType;
    field?: PhenotypeField.Attributes;
    value?: string | number;
  }

  interface ArrayType {
    type: Mongoose.ArrayTypeCriteria;
    value: string | number;
  }

  interface DataQuery {
    filter: PhenotypeField.Attributes;
    instances?: string[];
    participantIds?: string[];
    pagination?: App.PaginationRequest;
    term?: string;
    buckets?: (string | number)[];
    dontTransformData?: boolean;
  }

  type FilterQueryValueExact = FilterValue[];

  interface FilterQuery {
    isLabel: boolean;
    field: FilterId;
    instance: string[];
    value: FilterQueryValueExact | FilterQueryValueRange;
  }

  interface FilterQueryValueRange {
    from: string | number;
    to: string | number;
  }
}
