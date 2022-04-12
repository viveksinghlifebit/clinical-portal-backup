import { PhenotypeFieldRepository } from '@core/repos';
import { PhenotypeFieldUtils, ValidationUtils } from 'utils';

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
}
