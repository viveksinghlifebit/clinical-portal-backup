export class ValidationUtils {
  /**
   * Return if the array is empty.
   * @param array the array
   */
  static isArrayEmpty(array: Array<unknown>): boolean {
    return !Array.isArray(array) || array === undefined || array.length === 0;
  }

  /**
   * Return if the array is not empty.
   * @param array the array
   */
  static isArrayNotEmpty(array: Array<unknown>): boolean {
    return !this.isArrayEmpty(array);
  }
}
