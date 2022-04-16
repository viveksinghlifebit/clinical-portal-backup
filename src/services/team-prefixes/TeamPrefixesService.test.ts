import { TeamPrefixesService } from './TeamPrefixesService';

describe('TeamPrefixesService', () => {
  test('should return {} if TEAM_PREFIXES is not set', () => {
    expect(TeamPrefixesService.get()).toStrictEqual({});
  });

  test('should return parsedJSON if TEAM_PREFIXES is set', () => {
    const stringifiedObject = JSON.stringify({
      1234: 'test'
    });
    process.env.TEAM_PREFIXES = stringifiedObject;
    expect(TeamPrefixesService.get()).toStrictEqual(JSON.parse(stringifiedObject));

    process.env.TEAM_PREFIXES = undefined;
  });
});
