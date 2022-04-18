import { ClinicalRole, PatientStatus } from '@core/enums';
import { Patient, PatientWorkgroup, Workgroup } from '@core/models';
import { GenoMarkerRepository, PhenotypeFieldRepository, UserRepository } from '@core/repos';
import { IllegalArgumentError, ResourceNotFoundError } from 'errors';
import { cloneDeep } from 'lodash';
import mongoose from 'mongoose';
import { GenoMarkerBuilder, PatientWorkgroupBuilder, TeamBuilder, UserBuilder, WorkgroupBuilder } from 'testUtils';
import { PatientBuilder } from 'testUtils/patientBuilder';
import { WorkgroupService } from './workgroup.controller';
import { prepareSpyForPatientWorkgroup } from './workgroup.controller.test.utils';

describe('Workgroup Controller', () => {
  let mockFindByTermFn: jest.SpyInstance;
  let mockedFindUserByIdFn: jest.SpyInstance;
  const genomicMarkers = [
    new GenoMarkerBuilder().withCN('CN1').withFullLocation('location1').build(),
    new GenoMarkerBuilder().withCN('CN2').withFullLocation('location2').build()
  ];
  const team = new TeamBuilder().withName('Team').withId(new mongoose.Types.ObjectId().toHexString()).build();
  const user = new UserBuilder()
    .withName('User')
    .withId(new mongoose.Types.ObjectId().toHexString())
    .withRbacRoles(ClinicalRole.ReferringClinician)
    .withRbacRoles(ClinicalRole.FieldSpecialist)
    .build();

  let workgroup: Workgroup.Document;
  let patientWorkgroup: PatientWorkgroup.Document;
  let patient: Patient.Document;
  beforeEach(() => {
    mockFindByTermFn = jest.spyOn(Workgroup, 'findByTermAndTeam');
    mockedFindUserByIdFn = jest.spyOn(UserRepository, 'findById');
    patient = new PatientBuilder()
      .withId(new mongoose.Types.ObjectId())
      .withI('P0000000001')
      .withExternalID('externalId')
      .withExternalIDType('type')
      .withAddress([])
      .withStatus(PatientStatus.Drafted)
      .withName('aName')
      .withSurname('aSurname')
      .build();
    patient.view = jest.fn().mockReturnValue(patient);
    workgroup = cloneDeep(
      new WorkgroupBuilder().withName('Test Name').withTeam(String(team._id)).withOwner(String(user._id)).build()
    );
    patientWorkgroup = new PatientWorkgroupBuilder().withId('1').withWorkgroup(workgroup).withPatient(patient).build();
  });
  describe('createWorkgroup', () => {
    test('should create workgroup', async () => {
      const returnedWorkgroup = await WorkgroupService.createWorkgroup('Test Name', team, user);

      expect(returnedWorkgroup.name).toStrictEqual(workgroup.name);
      expect(String(returnedWorkgroup.owner)).toStrictEqual(String(workgroup.owner));
      expect(String(returnedWorkgroup.team)).toStrictEqual(String(workgroup.team));
    });
  });

  describe('deleteWorkgroup', () => {
    test('should delete the workgroup with valid workgroupId', async () => {
      const returnedWorkgroup = await WorkgroupService.createWorkgroup('Test Name', team, user);

      await WorkgroupService.deleteWorkgroup(String(returnedWorkgroup._id), String(team._id));

      const result = await Workgroup.findOne({ _id: returnedWorkgroup._id });
      expect(result).toBeNull();
    });

    test('should throw error if workgroupId is not present', async () => {
      const workgroupId = String(new mongoose.Types.ObjectId());
      await expect(WorkgroupService.deleteWorkgroup(workgroupId, String(team._id))).rejects.toThrowError(
        new IllegalArgumentError(`Cannot find workgroup with id ${workgroupId}.`)
      );
    });
  });

  describe('searchWorkgroups', () => {
    const searchCriteria = [
      {
        columnHeader: 'name',
        value: 'Test Name'
      }
    ];
    let aggregateSpy: jest.SpyInstance;
    beforeEach(() => {
      aggregateSpy = jest.spyOn(PatientWorkgroup, 'aggregate');
    });

    afterEach(jest.restoreAllMocks);
    test('should return empty result if not workgroup is present', async () => {
      aggregateSpy.mockResolvedValueOnce([
        {
          workgroup: 'test',
          patients: 2
        }
      ]);
      const result = await WorkgroupService.searchWorkgroups(searchCriteria, team._id.toString(), user, {});
      expect(result).toEqual({ page: 0, pages: 0, total: 0, workgroups: [] });
      expect(aggregateSpy).toHaveBeenCalled();
    });

    test('should return empty result if not workgroup is present', async () => {
      const createdWorkgroup1 = await WorkgroupService.createWorkgroup('Test Name', team, user);
      const createdWorkgroup2 = await WorkgroupService.createWorkgroup('Test Name', team, user);

      aggregateSpy.mockResolvedValueOnce([
        {
          _id: createdWorkgroup1._id,
          workgroup: 'test',
          patients: 2
        }
      ]);

      const result = await WorkgroupService.searchWorkgroups(searchCriteria, team._id.toString(), user, {
        sortBy: 'createdAt',
        sortByType: 'desc'
      });
      expect(result).toEqual({
        page: 0,
        pages: 1,
        total: 2,
        workgroups: expect.arrayContaining([
          {
            _id: String(createdWorkgroup1._id),
            name: 'Test Name',
            numberOfPatients: 2,
            owner: null,
            team: team._id.toString()
          },
          {
            _id: String(createdWorkgroup2._id),
            name: 'Test Name',
            numberOfPatients: 0,
            owner: null,
            team: team._id.toString()
          }
        ])
      });
      expect(aggregateSpy).toHaveBeenCalled();
    });
  });

  describe('validateWorkgroupPatientAccess', () => {
    test('should throw error if workgroupPatient is undefined', async () => {
      expect(() => WorkgroupService.validateWorkgroupPatientAccess(undefined, String(team._id))).toThrow();
    });

    test('should throw error if workgroup inside workgroupPatient is undefined', () => {
      expect(() =>
        WorkgroupService.validateWorkgroupPatientAccess(
          ({ workgroup: undefined } as unknown) as PatientWorkgroup.Document,
          String(team._id)
        )
      ).toThrow();
    });

    test('should throw error if team inside workgroup workgroupPatient is undefined', () => {
      expect(() =>
        WorkgroupService.validateWorkgroupPatientAccess(
          ({
            workgroup: {
              team: undefined
            }
          } as unknown) as PatientWorkgroup.Document,
          String(team._id)
        )
      ).toThrow();
    });

    test('should throw error if team does not match with provided teamId', () => {
      expect(() =>
        WorkgroupService.validateWorkgroupPatientAccess(
          ({
            workgroup: {
              team: new mongoose.Types.ObjectId()
            }
          } as unknown) as PatientWorkgroup.Document,
          String(team._id)
        )
      ).toThrow();
    });
    test('should not throw error if team match with provided teamId', () => {
      expect(
        WorkgroupService.validateWorkgroupPatientAccess(
          ({
            workgroup: {
              team: team._id
            }
          } as unknown) as PatientWorkgroup.Document,
          String(team._id)
        )
      ).toBeUndefined();
    });
  });

  describe('getWorkgroupPatient', () => {
    afterAll(jest.restoreAllMocks);
    test('When workgroupPatientId is invalid should return error', async () => {
      const spyFindOne: jest.SpyInstance = jest.spyOn(PatientWorkgroup, 'findOne');
      spyFindOne.mockImplementation(() => ({
        populate: () => undefined
      }));
      expect(
        WorkgroupService.getWorkgroupPatientById('workgroupPatientId', 'workgroupId', String(team._id))
      ).rejects.toThrowError(IllegalArgumentError);
    });

    test('When query is valid, no error should be thrown', async () => {
      prepareSpyForPatientWorkgroup(user, workgroup);
      const response = await WorkgroupService.getWorkgroupPatientById(
        'workgroupPatientId',
        'workgroupId',
        String(team._id)
      );
      expect(response).toBeDefined();
    });

    test('When query is valid, no error should be thrown if lean is false', async () => {
      prepareSpyForPatientWorkgroup(user, workgroup);
      const response = await WorkgroupService.getWorkgroupPatientById(
        'workgroupPatientId',
        'workgroupId',
        String(team._id),
        false
      );
      expect(response).toBeDefined();
    });
  });

  describe('suggestWorkgroups', () => {
    beforeAll(() => {
      mockFindByTermFn = jest.spyOn(Workgroup, 'findByTermAndTeam');
      mockFindByTermFn.mockImplementation(() => {
        return Promise.resolve([
          {
            view: () => workgroup
          }
        ]);
      });
      mockedFindUserByIdFn = jest.spyOn(UserRepository, 'findById').mockImplementation(() => {
        return Promise.resolve(user);
      });
    });
    afterAll(jest.restoreAllMocks);
    test('When no term defined should return error', async () => {
      await expect(WorkgroupService.getWorkgroupSuggestions(String(team._id))).rejects.toThrow(
        'The search term cannot be empty'
      );
      expect(mockFindByTermFn).toHaveBeenCalledTimes(0);
    });

    test('When term with special character provided should be replaced', async () => {
      await WorkgroupService.getWorkgroupSuggestions(String(team._id), 'withSpecialCharacter*');
      expect(mockFindByTermFn).toHaveBeenCalledWith('withSpecialCharacter\\*', String(team._id));
    });

    test('When valid term provided should return the workgroups with onwer populated', async () => {
      const workgroups = await WorkgroupService.getWorkgroupSuggestions(String(team._id), 'term');
      expect(mockedFindUserByIdFn).toHaveBeenCalledWith(user._id, { password: 0 });
      expect(workgroups[0]?.owner).toBeDefined();
    });
  });

  describe('deleteWorkgroupPatient', () => {
    let mockFindByIdAndTeamFn: jest.SpyInstance;
    let mockedDeletePatients: jest.SpyInstance;
    let mockedSaveWorkgroup: jest.SpyInstance;
    beforeEach(() => {
      mockFindByIdAndTeamFn = jest.spyOn(Workgroup, 'findByIdAndTeam');
      mockedDeletePatients = jest.spyOn(PatientWorkgroup, 'remove');
      mockedSaveWorkgroup = jest.spyOn(Workgroup, 'saveWorkgroup');
    });
    test('When workgroup not found, should return an error', async () => {
      mockFindByIdAndTeamFn.mockResolvedValue(null);
      await expect(
        WorkgroupService.deleteWorkgroupPatient(workgroup._id, 'aPatientId', String(team._id))
      ).rejects.toThrow(`Cannot find workgroup with id ${workgroup._id}`);
    });

    test('When workgroup found, delete patient should be called', async () => {
      mockFindByIdAndTeamFn.mockResolvedValue({ view: () => workgroup });
      mockedDeletePatients.mockResolvedValue(undefined);
      mockedSaveWorkgroup.mockResolvedValueOnce(workgroup);
      await WorkgroupService.deleteWorkgroupPatient(workgroup._id, 'aPatientId', String(team._id));
      expect(mockedDeletePatients).toHaveBeenCalledWith({ workgroup: workgroup._id, _id: 'aPatientId' });
    });
  });

  describe('saveWorkgroupPatientMarkers', () => {
    let findOneSpy: jest.SpyInstance;
    let mockGenoMarkerFindByCn: jest.SpyInstance;
    beforeEach(() => {
      findOneSpy = jest.spyOn(PatientWorkgroup, 'findOne');
      mockGenoMarkerFindByCn = jest.spyOn(GenoMarkerRepository, 'findByCNs');
      mockGenoMarkerFindByCn.mockResolvedValue(genomicMarkers);
    });
    afterEach(jest.restoreAllMocks);
    test('When workgroupPatientId is invalid should return error', async () => {
      findOneSpy.mockReturnValueOnce({
        populate: jest.fn().mockResolvedValue(undefined)
      });
      expect(
        WorkgroupService.saveWorkgroupPatientMarkers('workgroupPatientId', 'workgroupId', String(team._id))
      ).rejects.toThrowError(IllegalArgumentError);
    });

    test('When workgroupPatientId should return valid id if markers is empty', async () => {
      patientWorkgroup.save = jest.fn();
      patientWorkgroup.view = jest.fn().mockReturnValue(patientWorkgroup);

      findOneSpy.mockReturnValue({
        populate: jest.fn().mockResolvedValue(patientWorkgroup)
      });
      expect(
        await (
          await WorkgroupService.saveWorkgroupPatientMarkers('workgroupPatientId', 'workgroupId', String(team._id))
        )._id
      ).toStrictEqual('1');
    });

    test('When markers are not empty, geno marker repository is called', async () => {
      patientWorkgroup.save = jest.fn();
      patientWorkgroup.view = jest.fn().mockReturnValue(patientWorkgroup);
      patientWorkgroup.toJSON = jest.fn().mockImplementation(() => patientWorkgroup);

      findOneSpy.mockReturnValue({
        populate: jest.fn().mockResolvedValue(patientWorkgroup)
      });

      await WorkgroupService.saveWorkgroupPatientMarkers('workgroupPatientId', 'workgroupId', String(team._id), [
        'CN1'
      ]);
      expect(mockGenoMarkerFindByCn).toHaveBeenCalledWith(['CN1']);
    });
  });

  describe('getWorkgroupPatients', () => {
    let mockFindByIdAndTeamFn: jest.SpyInstance;
    const workgroupId = 'workgroupId';
    beforeEach(() => {
      mockFindByIdAndTeamFn = jest.spyOn(Workgroup, 'findByIdAndTeam');
    });
    test('When workgroup is not valid, should return error', async () => {
      mockFindByIdAndTeamFn.mockReturnValue(undefined);
      expect(WorkgroupService.getWorkgroupPatients(workgroupId, String(team._id), user)).rejects.toThrowError(
        ResourceNotFoundError
      );
    });

    test('When workgroup is valid, PatientWorkgroup find should be called', async () => {
      const mockPatientWorkgroupFind: jest.SpyInstance = jest.spyOn(PatientWorkgroup, 'find');
      mockPatientWorkgroupFind.mockReturnValue({
        populate: jest.fn().mockResolvedValue([patientWorkgroup])
      });
      mockFindByIdAndTeamFn.mockReturnValue(workgroup);
      await WorkgroupService.getWorkgroupPatients(workgroupId, String(team._id), user);
      expect(mockPatientWorkgroupFind).toBeCalledWith({ workgroup: workgroupId });
    });

    test('When workgroup is valid and matches with referring user then return patient', async () => {
      const mockPatientWorkgroupFind: jest.SpyInstance = jest.spyOn(PatientWorkgroup, 'find');
      mockPatientWorkgroupFind.mockReturnValue({
        populate: jest.fn().mockResolvedValue([
          {
            ...patientWorkgroup,
            view: jest.fn().mockReturnValue(patientWorkgroup),
            patient: {
              referringUsers: [
                {
                  name: user._id,
                  type: ClinicalRole.ReferringClinician
                }
              ],
              view: jest.fn().mockResolvedValue(patient)
            }
          }
        ])
      });
      mockFindByIdAndTeamFn.mockReturnValue(workgroup);
      const result = await WorkgroupService.getWorkgroupPatients(workgroupId, String(team._id), user);
      expect(result).toStrictEqual([{ _id: '1', patient, workgroup }]);
    });
  });

  describe('addFieldToWorkgroupPatient', () => {
    const inputFilter: PatientWorkgroup.FieldInput = {
      array: ['0'],
      filterId: 1,
      instance: ['0']
    };
    let patientWorkgroupFindOneSpy: jest.SpyInstance;
    beforeEach(() => {
      patientWorkgroupFindOneSpy = jest.spyOn(PatientWorkgroup, 'findOne');
      patientWorkgroupFindOneSpy.mockReturnValue({
        populate: jest.fn().mockResolvedValue(patientWorkgroup)
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('When workgroupPatientId is invalid, should return error', async () => {
      patientWorkgroupFindOneSpy.mockReturnValue({
        populate: jest.fn().mockResolvedValue(undefined)
      });
      await expect(
        WorkgroupService.addFieldToWorkgroupPatient('workgroupPatientId', 'workgroupId', inputFilter, String(team._id))
      ).rejects.toThrowError(IllegalArgumentError);
    });

    test('When filter not found, should return error', async () => {
      const findByFilterIdSpy: jest.SpyInstance = jest.spyOn(PhenotypeFieldRepository, 'findByFilterId');
      findByFilterIdSpy.mockReturnValue(Promise.resolve(undefined));
      await expect(
        WorkgroupService.addFieldToWorkgroupPatient('workgroupPatientId', 'workgroupId', inputFilter, String(team._id))
      ).rejects.toThrowError(ResourceNotFoundError);
    });

    test('When normal data, the filter should be added to the patient filters', async () => {
      const mockGetWorkgroupPatientById: jest.SpyInstance = jest.spyOn(WorkgroupService, 'getWorkgroupPatientById');
      mockGetWorkgroupPatientById.mockResolvedValueOnce({
        ...patientWorkgroup,
        save: jest.fn().mockResolvedValue(undefined),
        view: jest.fn().mockReturnValue(patientWorkgroup)
      });
      const workgroupSpyById: jest.SpyInstance = jest.spyOn(WorkgroupService, 'getWorkgroupPatientById');
      workgroupSpyById.mockReturnValueOnce(patientWorkgroup);
      const findByFilterIdSpy: jest.SpyInstance = jest.spyOn(PhenotypeFieldRepository, 'findByFilterId');
      findByFilterIdSpy.mockReturnValue(Promise.resolve(inputFilter));

      await WorkgroupService.addFieldToWorkgroupPatient(
        'workgroupPatientId',
        'workgroupId',
        inputFilter,
        String(team._id)
      );
      expect(mockGetWorkgroupPatientById).toBeCalled();
    });
  });

  describe('removeFieldFromWorkgroupPatient', () => {
    let getWorkgroupPatientByIdSpy: jest.SpyInstance;
    let findByFilterIdSpy: jest.SpyInstance;
    beforeAll(() => {
      getWorkgroupPatientByIdSpy = jest.spyOn(WorkgroupService, 'getWorkgroupPatientById');
      findByFilterIdSpy = jest.spyOn(PhenotypeFieldRepository, 'findByFilterId');
    });

    afterAll(jest.restoreAllMocks);

    test('should throw error if filter is not present', async () => {
      getWorkgroupPatientByIdSpy.mockResolvedValue({
        _id: new mongoose.Types.ObjectId()
      });
      findByFilterIdSpy.mockResolvedValue(undefined);

      await expect(
        WorkgroupService.removeFieldFromWorkgroupPatient('workgroupid', 'workgroupPatientId', 1, String(team._id))
      ).rejects.toThrowError(ResourceNotFoundError);
    });

    test('should call the workpatient.save', async () => {
      const saveFn = jest.fn();
      getWorkgroupPatientByIdSpy.mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        save: saveFn
      });
      findByFilterIdSpy.mockResolvedValue({
        id: 1,
        value: 'phenotype'
      });

      await WorkgroupService.removeFieldFromWorkgroupPatient('workgroupid', 'workgroupPatientId', 1, String(team._id));

      expect(saveFn).toHaveBeenCalled();
    });

    test('should call the workpatient.save and pull if filterId matches', async () => {
      const saveFn = jest.fn();
      const patientWorkgroup = new PatientWorkgroup({
        _id: new mongoose.Types.ObjectId(),
        fields: [
          {
            userAdded: true,
            filterId: 1
          }
        ]
      });
      patientWorkgroup.save = saveFn;
      getWorkgroupPatientByIdSpy.mockResolvedValue(patientWorkgroup);
      findByFilterIdSpy.mockResolvedValue({
        id: 1,
        value: 'phenotype'
      });

      await WorkgroupService.removeFieldFromWorkgroupPatient('workgroupid', 'workgroupPatientId', 1, String(team._id));

      expect(saveFn).toHaveBeenCalled();
    });
  });

  describe('validatePatientInWorkgroup', () => {
    let patientFindOneSpy: jest.SpyInstance;
    let workgroupFindByNameAndTeamSpy: jest.SpyInstance;
    let patientWorkgroupCountSpy: jest.SpyInstance;
    beforeAll(() => {
      patientFindOneSpy = jest.spyOn(Patient, 'findOne');
      workgroupFindByNameAndTeamSpy = jest.spyOn(Workgroup, 'findByNameAndTeam');
      patientWorkgroupCountSpy = jest.spyOn(PatientWorkgroup, 'countByWorkgroupAndPatient');
    });

    afterAll(jest.restoreAllMocks);
    test('When patient doesnt exist, should return invalid', async () => {
      patientFindOneSpy.mockReturnValue({
        lean: jest.fn().mockResolvedValue(undefined)
      });

      const response = await WorkgroupService.validatePatientInWorkgroup(workgroup.name, patient._id, String(team._id));
      expect(response.isValid).toBeFalsy();
      expect(response.message).toStrictEqual('The patient id provided doesnt exist.');
    });

    test('should throw error if any internal server error is there', async () => {
      patientFindOneSpy.mockReturnValue({
        lean: jest.fn().mockRejectedValue(new Error('throw'))
      });

      await expect(
        WorkgroupService.validatePatientInWorkgroup(workgroup.name, patient._id, String(team._id))
      ).rejects.toThrowError(new Error('throw'));
    });

    test('When patient is not enrolled, should return invalid', async () => {
      patientFindOneSpy.mockReturnValue({
        lean: jest.fn().mockResolvedValue(patient)
      });

      const response = await WorkgroupService.validatePatientInWorkgroup(workgroup.name, patient._id, String(team._id));
      expect(response.isValid).toBeFalsy();
      expect(response.message).toStrictEqual('The patient is not yet enrolled.');
    });

    test('When patient is enrolled but already exists in the workgroup, should return invalid', async () => {
      patientFindOneSpy.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ ...patient, status: PatientStatus.Enrolled })
      });
      workgroupFindByNameAndTeamSpy.mockResolvedValueOnce(workgroup);
      patientWorkgroupCountSpy.mockResolvedValueOnce(1);

      const response = await WorkgroupService.validatePatientInWorkgroup(workgroup.name, patient._id, String(team._id));

      expect(response.isValid).toBeFalsy();
      expect(response.message).toStrictEqual(
        'The patient already exists in the workgroup. Please specify a new one, or add different patient'
      );
    });

    test('When workgroup doesnt exists, should return valid', async () => {
      patientFindOneSpy.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ ...patient, status: PatientStatus.Enrolled })
      });
      workgroupFindByNameAndTeamSpy.mockResolvedValueOnce(undefined);

      const response = await WorkgroupService.validatePatientInWorkgroup(workgroup.name, patient._id, String(team._id));

      expect(response.isValid).toBeTruthy();
      expect(response.message).toBeUndefined();
    });

    test('When workgroup exists but the patient not in the workgroup, should return valid', async () => {
      patientFindOneSpy.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ ...patient, status: PatientStatus.Enrolled })
      });
      workgroupFindByNameAndTeamSpy.mockResolvedValueOnce(workgroup);
      patientWorkgroupCountSpy.mockResolvedValueOnce(0);

      const response = await WorkgroupService.validatePatientInWorkgroup(workgroup.name, patient._id, String(team._id));
      expect(response.isValid).toBeTruthy();
      expect(response.message).toBeUndefined();
    });
  });
});
