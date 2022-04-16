export class TeamPrefixesService {
  /**
   * Gets the team prefixes
   */
  public static get(): Record<string, string> {
    return process.env.TEAM_PREFIXES ? JSON.parse(process.env.TEAM_PREFIXES) : {};
  }
}
