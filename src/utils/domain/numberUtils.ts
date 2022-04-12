export class NumberUtils {
  /**
   * Transform the input number to number if it's possible, otherwise return the input value.
   * @param input  the input to be transformed
   */
  static castToNumberIfPossible(input: string | number): number | string {
    if (input && !isNaN(Number(input))) {
      return Number(input);
    }
    return input;
  }

  /**
   * Returns the average.
   * @param values the values
   */
  static average(values: number[]): number {
    if (values.length === 0) return 0;
    const sum = values.reduce((a, b) => a + b, 0);
    return sum / values.length || 0;
  }

  static isNumeric(value: number | string): boolean {
    return value != null && value !== '' && !isNaN(Number(value.toString()));
  }
}
