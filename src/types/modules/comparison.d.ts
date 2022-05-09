declare namespace Comparison {
  interface FieldComparisonResults {
    total: number;
    fieldId: PhenotypeField.Attributes;
    existingValues: Record<string, number>;
    notExistingValues: Record<string, number>;
  }

  interface VariantComparisonGraphResponse {
    genotypes: Record<string, number>;
    acmgVerdicts: Record<string, number>;
  }
}
