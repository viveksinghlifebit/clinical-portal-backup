import { UserRepository } from '@core/repos';

const getSearchCriteria = async (item: Filter.SearchItem): Promise<Record<string, unknown>> => {
  const criteria = {} as Record<string, unknown>;
  const column = item.columnHeader as string;

  if (column === 'owner') {
    criteria[column] = { $in: await UserRepository.getUserIdsByTerm(item.value as string) };
    return criteria;
  }

  if (item.value) {
    criteria[column] = isNaN(Number(item.value)) ? { $in: new RegExp(item.value, 'i') } : { $in: item.value };
    return criteria;
  }

  if (item.low || item.high) {
    criteria[column] = getRangeCriteria(item);
  }
  return criteria;
};

const getRangeCriteria = (item: Filter.SearchItem): Record<string, unknown> => {
  const range = {} as Record<string, unknown>;

  if (item.low) {
    range['$gte'] = item.low;
  }
  if (item.high) {
    range['$lte'] = item.high;
  }
  return range;
};
/**
 * Returns criteria for workgroups search query
 *
 * @param  {SearchItem[]} searchCriteria
 * @param  {string} teamId
 * @returns Promise<QueryConditions>
 */
export const constructWorkgroupsSearchCriteria = async (
  searchCriteria: Filter.SearchItem[],
  teamId: string
): Promise<Mongoose.QueryConditions> => {
  const baseCriteria: Mongoose.QueryConditions = { team: teamId };
  if (searchCriteria.length === 0) {
    return baseCriteria;
  }
  const results = await Promise.all(searchCriteria.map(getSearchCriteria));
  return results.reduce((accumulatedCriteria, item) => ({ ...accumulatedCriteria, ...item }), baseCriteria);
};
