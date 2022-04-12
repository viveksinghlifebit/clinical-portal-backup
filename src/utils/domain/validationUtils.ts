export class ValidationUtils {
  /**
   * Return if the array is empty.
   * @param array the array
   */
  static isArrayEmpty(array: Array<unknown>): boolean {
    return !Array.isArray(array) || array === undefined || array.length === 0;
  }
}
