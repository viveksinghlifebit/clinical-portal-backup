import { PatientUtils } from './patientUtils';

describe('Patient Utils', () => {
  describe('createPatientFieldForIdentifiable', () => {
    test('should return value as `-` if not passed', () => {
      expect(PatientUtils.createPatientFieldForIdentifiable('label')).toStrictEqual({
        readOnly: true,
        filterId: undefined,
        label: 'label',
        value: '-',
        instance: undefined,
        array: undefined,
        instanceNames: undefined
      });
    });
  });
  describe('getAddressToDisplay', () => {
    test('should return default value if address is not passed', () => {
      expect(PatientUtils.getAddressToDisplay((null as unknown) as Patient.Address, 'address')).toBe('address');
    });

    test('should return default value if address is not passed', () => {
      expect(
        PatientUtils.getAddressToDisplay(
          {
            address1: 'address1',
            address2: 'address2',
            area: 'area',
            cityAndCountry: 'cityAndCountry'
          },
          'address'
        )
      ).toBe('address1 address2 area cityAndCountry');
    });
  });
});
