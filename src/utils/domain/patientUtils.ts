import { compact } from 'lodash';

export class PatientUtils {
  /**
   * Returns patient field for identifiable fields
   *
   * @returns <PatientWorkgroupFieldWithValues>
   * @param label the label
   * @param value the value
   */
  static createPatientFieldForIdentifiable(label: string, value?: string): PatientWorkgroup.WithValues {
    return {
      readOnly: true,
      filterId: undefined,
      label,
      value: value || '-',
      instance: undefined,
      array: undefined,
      instanceNames: undefined
    };
  }

  /**
   * Returns the address to display.
   * @param address the address
   * @param defaultValue the default value
   */
  public static getAddressToDisplay(address: Patient.Address, defaultValue: string): string {
    if (!address) {
      return defaultValue;
    }
    return compact([address.address1, address.address2, address.area, address.cityAndCountry]).join(' ');
  }
}
