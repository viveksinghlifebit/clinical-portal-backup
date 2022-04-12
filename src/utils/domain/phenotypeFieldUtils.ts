export class PhenotypeFieldUtils {
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
}
