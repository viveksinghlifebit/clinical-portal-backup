import { PatientStatus } from '@core/enums';
import { Patient, PatientSample, PatientWorkgroup, Workgroup } from '@core/models';
import { WorkgroupService } from '@core/modules';
import { PhenotypeFieldRepository } from '@core/repos';
import config from 'config';
import { IllegalArgumentError } from 'errors';
import mongoose from 'mongoose';
import { PhenotypeFiltersService } from 'services/filter';
import { PatientWorkgroupBuilder, TeamBuilder, UserBuilder, WorkgroupBuilder } from 'testUtils';
import { PatientBuilder } from 'testUtils/patientBuilder';
import { PhenotypeTestFieldBuilder } from 'testUtils/phenotypeFieldBuilder';
import { getPatientView } from './mocks/patient.mocks';
import { PatientDataService } from './patientDataService';
import { PatientService } from './patientService';

describe('PatientService', () => {
  const user = new UserBuilder().withId('1').withName('user').withSurname('name').build();
  const team = new TeamBuilder().withId('1').withName('team').build();
  const patientId = new mongoose.Types.ObjectId();
  const owner = new mongoose.Types.ObjectId();
  const workgroup = new WorkgroupBuilder()
    .withId(new mongoose.Types.ObjectId().toHexString())
    .withName('test-workgroup')
    .build();
  const patient = new PatientBuilder()
    .withI('P01')
    .withId(patientId)
    .withName('name')
    .withSurname('surname')
    .withLabPortalId('MockedId')
    .withOwner(owner)
    .build();

  let patientFindOneSpy: jest.SpyInstance;
  let workgroupFindByNameAndTeamSpy: jest.SpyInstance;
  let countByWorkgroupAndPatientSpy: jest.SpyInstance;

  beforeEach(() => {
    patientFindOneSpy = jest.spyOn(Patient, 'findOne');
    workgroupFindByNameAndTeamSpy = jest.spyOn(Workgroup, 'findByNameAndTeam');
    countByWorkgroupAndPatientSpy = jest.spyOn(PatientWorkgroup, 'countByWorkgroupAndPatient');
  });

  describe('createPatient', () => {
    let patientWorkgroupFindOneSpy: jest.SpyInstance;
    let patientWorkgroupCreateSpy: jest.SpyInstance;
    let patientFieldSpy: jest.SpyInstance;
    let patientFindBySpy: jest.SpyInstance;
    let countByWorkgroupSpy: jest.SpyInstance;
    let saveWorkgroupSpy: jest.SpyInstance;
    let patientDataServiceCreateDataSpy: jest.SpyInstance;
    let workgroupServiceCreateWorkgroupSpy: jest.SpyInstance;
    const patientWorkgroup = new PatientWorkgroupBuilder()
      .withId('1')
      .withWorkgroup(workgroup)
      .withPatient(patient)
      .build();
    beforeEach(() => {
      ((patientWorkgroup as unknown) as PatientWorkgroup.Document).view = jest.fn().mockReturnValue(patientWorkgroup);
      ((patient as unknown) as Patient.Document).view = jest.fn().mockReturnValue(patient);
      jest.spyOn(PatientService, 'validateCreatePatient').mockResolvedValue(undefined);

      patientWorkgroupFindOneSpy = jest.spyOn(PatientWorkgroup, 'findOne');
      patientWorkgroupCreateSpy = jest.spyOn(PatientWorkgroup, 'create');
      patientFieldSpy = jest.spyOn(PatientService, 'getPatientFields');
      patientFindBySpy = jest.spyOn(Patient, 'findById');
      countByWorkgroupSpy = jest.spyOn(PatientWorkgroup, 'countByWorkgroup');
      saveWorkgroupSpy = jest.spyOn(Workgroup, 'saveWorkgroup');
      patientDataServiceCreateDataSpy = jest.spyOn(PatientDataService, 'createPatientData');
      workgroupServiceCreateWorkgroupSpy = jest.spyOn(WorkgroupService, 'createWorkgroup');
    });
    afterAll(() => {
      jest.restoreAllMocks();
    });

    test('When no workgroup exists - should be created', async () => {
      patientWorkgroupFindOneSpy.mockReturnValue({
        populate: () => patientWorkgroup
      });

      workgroupFindByNameAndTeamSpy.mockResolvedValueOnce(null);
      jest.spyOn(PatientSample, 'find').mockResolvedValueOnce([]);
      patientFieldSpy.mockResolvedValueOnce(undefined);
      patientWorkgroupCreateSpy.mockResolvedValue({
        _id: workgroup,
        save: jest.fn().mockReturnValue(workgroup)
      });
      patientFindBySpy.mockImplementation(() => ({
        view: jest.fn().mockReturnValue(patient)
      }));
      patientFindOneSpy.mockImplementation(() => ({
        view: jest.fn().mockReturnValue(patient)
      }));
      countByWorkgroupSpy.mockReturnValueOnce(1);
      saveWorkgroupSpy.mockReturnValueOnce(undefined);
      patientDataServiceCreateDataSpy.mockReturnValueOnce(undefined);

      const mockedCreateFn: jest.Mock = jest.fn();
      mockedCreateFn.mockReturnValueOnce(workgroup);
      workgroupServiceCreateWorkgroupSpy.mockImplementation(mockedCreateFn);

      const input: CorePatient.WorkgroupPatientCreateInput = {
        description: 'description',
        patientId: '6042707eac80bd018ec78929',
        workgroupName: 'test-workgroup'
      };
      await PatientService.createPatient(input, user, team);
      expect(mockedCreateFn).toBeCalledWith(input.workgroupName, team, user);
    });

    test('When workgroup does exist - should be used', async () => {
      workgroupFindByNameAndTeamSpy.mockReturnValueOnce(workgroup);
      patientFieldSpy.mockReturnValueOnce(undefined);
      countByWorkgroupSpy.mockReturnValueOnce(1);
      patientWorkgroupCreateSpy.mockReturnValueOnce({
        _id: workgroup.name,
        save: jest.fn().mockReturnValue(workgroup),
        toJSON: jest.fn().mockReturnValue(workgroup)
      });
      patientFindBySpy.mockImplementation(() => ({
        view: jest.fn().mockReturnValue(patient)
      }));
      patientFindOneSpy.mockImplementation(() => ({
        view: jest.fn().mockReturnValue(patient)
      }));
      patientDataServiceCreateDataSpy.mockReturnValueOnce(undefined);

      const mockedCreateFn: jest.Mock = jest.fn();
      mockedCreateFn.mockReturnValueOnce(workgroup);
      workgroupServiceCreateWorkgroupSpy.mockImplementation(mockedCreateFn);

      const mockedSaveFn: jest.Mock = jest.fn();
      mockedSaveFn.mockReturnValueOnce(workgroup);
      saveWorkgroupSpy.mockImplementation(mockedSaveFn);

      const input: CorePatient.WorkgroupPatientCreateInput = {
        description: 'description',
        patientId: '6042707eac80bd018ec78929',
        workgroupName: 'test-workgroup'
      };
      await PatientService.createPatient(input, user, team);
      expect(mockedCreateFn).toBeCalledTimes(0);
      expect(mockedSaveFn).toBeCalledTimes(1);
    });
  });

  describe('validateCreatePatient', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('should throw error if patient is not present', async () => {
      patientFindOneSpy.mockImplementation(() => ({
        lean: jest.fn().mockReturnValue(null)
      }));
      workgroupFindByNameAndTeamSpy.mockReturnValueOnce(undefined);
      await expect(
        PatientService.validateCreatePatient(new mongoose.Types.ObjectId().toHexString(), 'test-workgroup', '1')
      ).rejects.toThrow(new IllegalArgumentError('The patient id provided doesnt exist.'));
    });

    test('should throw error if patient is drafted', async () => {
      patientFindOneSpy.mockImplementation(() => ({
        lean: jest.fn().mockReturnValue({ ...patient, status: PatientStatus.Drafted })
      }));
      workgroupFindByNameAndTeamSpy.mockReturnValueOnce(undefined);
      await expect(
        PatientService.validateCreatePatient(new mongoose.Types.ObjectId().toHexString(), 'test-workgroup', '1')
      ).rejects.toThrow(new IllegalArgumentError('The patient is not yet enrolled.'));
    });
    test('When patient input data are valid - no workgroup exists', async () => {
      patientFindOneSpy.mockImplementation(() => ({
        lean: jest.fn().mockReturnValue(patient)
      }));
      workgroupFindByNameAndTeamSpy.mockReturnValueOnce(undefined);
      await expect(PatientService.validateCreatePatient('1', 'test-workgroup', '1')).resolves.toBeUndefined();
    });

    test('When patient input data are valid - workgroup exists', async () => {
      patientFindOneSpy.mockImplementation(() => ({
        lean: jest.fn().mockReturnValue(patient)
      }));
      const workgroup = new WorkgroupBuilder().withName('test-workgroup').build();
      workgroupFindByNameAndTeamSpy.mockReturnValueOnce(workgroup);
      countByWorkgroupAndPatientSpy.mockReturnValueOnce(0);
      await expect(
        PatientService.validateCreatePatient(new mongoose.Types.ObjectId().toHexString(), 'test-workgroup', '1')
      ).resolves.toBeUndefined();
    });

    test('When patient input data are not valid - patient exists in workgroup', async () => {
      const workgroup = new WorkgroupBuilder().withName('test-workgroup').build();
      patientFindOneSpy.mockImplementation(() => ({
        lean: jest.fn().mockReturnValue(patient)
      }));
      workgroupFindByNameAndTeamSpy.mockReturnValueOnce(workgroup);
      countByWorkgroupAndPatientSpy.mockReturnValueOnce(1);
      await expect(
        PatientService.validateCreatePatient(new mongoose.Types.ObjectId().toHexString(), 'test-workgroup', '1')
      ).rejects.toThrow(
        new IllegalArgumentError(
          'The patient already exists in the workgroup. Please specify a new one, or add different patient'
        )
      );
    });
  });

  describe('getPatientFields', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('When returns the normal values', async () => {
      const mockedFindFn: jest.Mock = jest.fn();
      // The first time
      mockedFindFn.mockReturnValueOnce('term1;term2');
      // The second time
      mockedFindFn.mockReturnValueOnce('French');
      // The third time
      mockedFindFn.mockReturnValueOnce('Male');

      jest.spyOn(PhenotypeFiltersService, 'getFilterValuesForParticipant').mockImplementation(mockedFindFn);
      const phenotypeFieldRepositoryFindSpy: jest.SpyInstance = jest.spyOn(PhenotypeFieldRepository, 'find');
      phenotypeFieldRepositoryFindSpy.mockReturnValue([
        new PhenotypeTestFieldBuilder()
          .withId(config.individualBrowser.patient.initFilters[0]?.filterId as number)
          .build(),
        new PhenotypeTestFieldBuilder()
          .withId(config.individualBrowser.patient.initFilters[1]?.filterId as number)
          .build(),
        new PhenotypeTestFieldBuilder()
          .withId(config.individualBrowser.patient.initFilters[2]?.filterId as number)
          .build(),
        new PhenotypeTestFieldBuilder().withId(21).withName('name').build()
      ]);

      const patientView = getPatientView([]);
      const response = await PatientService.getPatientFields(
        [
          {
            array: ['0'],
            filterId: 21,
            instance: ['0'],
            label: (undefined as unknown) as string
          },
          {
            array: ['0'],
            filterId: 22,
            instance: ['0'],
            label: (undefined as unknown) as string
          }
        ],
        patientView
      );

      expect(response).toHaveLength(9);
      expect(response[0]?.readOnly).toBeTruthy();
      expect(response[0]?.filterId).toBeUndefined();
      expect(response[0]?.label).toStrictEqual('Date of Birth:');
      expect(response[0]?.value).toStrictEqual('2000-11-15T00:00:00.000Z');
      expect(response[0]?.instance).toBeUndefined();
      expect(response[0]?.array).toBeUndefined();
      expect(response[0]?.instanceNames).toBeUndefined();

      expect(response[1]?.readOnly).toBeTruthy();
      expect(response[1]?.filterId).toBeUndefined();
      expect(response[1]?.label).toStrictEqual('Email:');
      expect(response[1]?.value).toStrictEqual(patientView.email);
      expect(response[1]?.instance).toBeUndefined();
      expect(response[1]?.array).toBeUndefined();
      expect(response[1]?.instanceNames).toBeUndefined();

      expect(response[2]?.readOnly).toBeTruthy();
      expect(response[2]?.filterId).toBeUndefined();
      expect(response[2]?.label).toStrictEqual('Phone Number:');
      expect(response[2]?.value).toStrictEqual(patientView.phoneNumber);
      expect(response[2]?.instance).toBeUndefined();
      expect(response[2]?.array).toBeUndefined();
      expect(response[2]?.instanceNames).toBeUndefined();

      expect(response[3]?.readOnly).toBeTruthy();
      expect(response[3]?.filterId).toBeUndefined();
      expect(response[3]?.label).toStrictEqual('Address:');
      expect(response[3]?.value).toStrictEqual(
        `${patientView.addresses[0]?.address1} ${patientView.addresses[0]?.address2}` +
          ` ${patientView.addresses[0]?.area} ${patientView.addresses[0]?.cityAndCountry}`
      );
      expect(response[3]?.instance).toBeUndefined();
      expect(response[3]?.array).toBeUndefined();
      expect(response[3]?.instanceNames).toBeUndefined();

      expect(response[4]?.readOnly).toBeTruthy();
      expect(response[4]?.filterId).toStrictEqual(config.individualBrowser.patient.initFilters[0]?.filterId as number);
      expect(response[4]?.label).toStrictEqual(config.individualBrowser.patient.initFilters[0]?.label);
      expect(response[4]?.value).toStrictEqual('term1;term2');
      expect(response[4]?.instance).toStrictEqual(config.individualBrowser.patient.initFilters[0]?.instance);
      expect(response[4]?.array).toStrictEqual(config.individualBrowser.patient.initFilters[0]?.array);

      expect(response[5]?.readOnly).toBeTruthy();
      expect(response[5]?.filterId).toStrictEqual(config.individualBrowser.patient.initFilters[1]?.filterId);
      expect(response[5]?.label).toStrictEqual(config.individualBrowser.patient.initFilters[1]?.label);
      expect(response[5]?.value).toStrictEqual('French');
      expect(response[5]?.instance).toStrictEqual(config.individualBrowser.patient.initFilters[1]?.instance);
      expect(response[5]?.array).toStrictEqual(config.individualBrowser.patient.initFilters[1]?.array);

      expect(response[6]?.readOnly).toBeTruthy();
      expect(response[6]?.filterId).toStrictEqual(config.individualBrowser.patient.initFilters[2]?.filterId);
      expect(response[6]?.label).toStrictEqual(config.individualBrowser.patient.initFilters[2]?.label);
      expect(response[6]?.value).toStrictEqual('Male');
      expect(response[6]?.instance).toStrictEqual(config.individualBrowser.patient.initFilters[2]?.instance);
      expect(response[6]?.array).toStrictEqual(config.individualBrowser.patient.initFilters[2]?.array);
    });

    test('should have index+1 in addresses if patient have more than one address', async () => {
      const mockedFindFn: jest.Mock = jest.fn();
      // The first time
      mockedFindFn.mockReturnValueOnce('term1;term2');
      // The second time
      mockedFindFn.mockReturnValueOnce('French');
      // The third time
      mockedFindFn.mockReturnValueOnce('Male');

      jest.spyOn(PhenotypeFiltersService, 'getFilterValuesForParticipant').mockImplementation(mockedFindFn);
      const phenotypeFieldRepositoryFindSpy: jest.SpyInstance = jest.spyOn(PhenotypeFieldRepository, 'find');
      phenotypeFieldRepositoryFindSpy.mockReturnValue([
        new PhenotypeTestFieldBuilder()
          .withId(config.individualBrowser.patient.initFilters[0]?.filterId as number)
          .build(),
        new PhenotypeTestFieldBuilder()
          .withId(config.individualBrowser.patient.initFilters[1]?.filterId as number)
          .build(),
        new PhenotypeTestFieldBuilder()
          .withId(config.individualBrowser.patient.initFilters[2]?.filterId as number)
          .build()
      ]);

      const patientView = getPatientView([
        {
          address1: 'address1',
          address2: 'address1',
          area: 'area2',
          cityAndCountry: 'city'
        }
      ]);
      const response = await PatientService.getPatientFields([], patientView);

      expect(response).toHaveLength(8);

      expect(response[3]?.label).toStrictEqual('Address 1:');
      expect(response[3]?.value).toStrictEqual(
        `${patientView.addresses[0]?.address1} ${patientView.addresses[0]?.address2}` +
          ` ${patientView.addresses[0]?.area} ${patientView.addresses[0]?.cityAndCountry}`
      );
    });
  });
});
