import { ClinicalRole, PatientStatus } from '@core/enums';
import { PatientSample, PatientSampleSequencingLibrary, PatientWorkgroup, Workgroup } from '@core/models';
import { IllegalArgumentError } from 'errors';
import { cloneDeep } from 'lodash';
import mongoose from 'mongoose';
import { PatientWorkgroupBuilder, TeamBuilder, UserBuilder, WorkgroupBuilder } from 'testUtils';
import { PatientBuilder } from 'testUtils/patientBuilder';
import { WorkgroupService } from './workgroup.controller';

describe('Workgroup Controller', () => {
  const team = new TeamBuilder().withName('Team').withId(new mongoose.Types.ObjectId().toHexString()).build();
  const user = new UserBuilder()
    .withName('User')
    .withId(new mongoose.Types.ObjectId().toHexString())
    .withRbacRoles(ClinicalRole.ReferringClinician)
    .withRbacRoles(ClinicalRole.FieldSpecialist)
    .build();

  let workgroup: Workgroup.Document;
  beforeEach(() => {
    workgroup = cloneDeep(
      new WorkgroupBuilder().withName('Test Name').withTeam(String(team._id)).withOwner(String(user._id)).build()
    );
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
          ({ workgroup: undefined } as unknown) as PatientWorkgroup.View,
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
          } as unknown) as PatientWorkgroup.View,
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
          } as unknown) as PatientWorkgroup.View,
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
          } as unknown) as PatientWorkgroup.View,
          String(team._id)
        )
      ).toBeUndefined();
    });
  });

  describe('getWorkgroupPatient', () => {
    afterAll(jest.restoreAllMocks);
    test('When workgroupPatientId is invalid should return error', async () => {
      const spyFindOne: jest.SpyInstance = jest.spyOn(PatientWorkgroup, 'findOne');
      spyFindOne.mockImplementation(() => {
        const mockFind = {
          populate: () => undefined
        };
        return mockFind;
      });
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
});
function prepareSpyForPatientWorkgroup(user: User, workgroup: Workgroup.Document): void {
  const patienSampleSpy: jest.SpyInstance = jest.spyOn(PatientSample, 'find');
  patienSampleSpy.mockResolvedValue([
    {
      view: jest.fn().mockReturnValue({
        owner: user,
        sampleId: 'sampleId'
      })
    }
  ]);

  const patientSampleSequencingLibrarySpy: jest.SpyInstance = jest.spyOn(PatientSampleSequencingLibrary, 'find');
  patientSampleSequencingLibrarySpy.mockResolvedValue([
    {
      view: jest.fn().mockReturnValue({
        owner: user,
        sequencingId: 'sequencingId'
      })
    }
  ]);
  const patient = (new PatientBuilder()
    .withId(new mongoose.Types.ObjectId())
    .withI('P0000000001')
    .withExternalID('externalId')
    .withExternalIDType('type')
    .withStatus(PatientStatus.Drafted)
    .withName('aName')
    .withSurname('aSurname')
    .withAddress([
      {
        address1: 'address1',
        address2: 'address2',
        cityAndCountry: 'cityAndCountry',
        area: 'area'
      }
    ])
    .build() as unknown) as Patient.Document;
  patient.view = jest.fn().mockReturnValue(patient);

  const patientWorkgroup = (new PatientWorkgroupBuilder()
    .withId('1')
    .withWorkgroup(workgroup)
    .withPatient(patient)
    .build() as unknown) as PatientWorkgroup.Document;
  patientWorkgroup.save = jest.fn();
  patientWorkgroup.view = jest.fn().mockReturnValue(patientWorkgroup);
  patientWorkgroup.toJSON = jest.fn().mockImplementation(() => patientWorkgroup);

  const spyFindOne: jest.SpyInstance = jest.spyOn(PatientWorkgroup, 'findOne');
  spyFindOne.mockImplementationOnce(() => {
    const mockFind = {
      populate: () => patientWorkgroup
    };
    return mockFind;
  });
}
