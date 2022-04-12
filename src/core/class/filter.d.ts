declare namespace Filter {
  type FilterValue = string | number;
  type FilterId = PredefinedFilterId | UserDefinedFilterId;
  type PredefinedFilterId = number;
  type UserDefinedFilterId = string;

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
}
