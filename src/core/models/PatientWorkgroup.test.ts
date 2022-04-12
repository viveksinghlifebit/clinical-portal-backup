import { ClinicalRole } from '@core/enums';
import { Types } from 'mongoose';
import { UserBuilder } from 'testUtils';
import { PatientWorkgroup } from './PatientWorkgroup';
describe('PatientWorkgroup', () => {
  const getWorkgroup = (): PatientWorkgroup.Document =>
    (({
      _id: new Types.ObjectId(),
      markers: [
        {
          _id: 'id',
          cn: 'cn',
          location: 'location'
        }
      ],
      comparisonFilters: [1],
      workgroup: 'workgroup',
      description: 'description',
      markersDefinition: [
        {
          cn: 'cn',
          fullLocation: 'f',
          gene: 'g',
          id: 1,
          index: 1
        }
      ],
      igvFiles: ['test'],
      associatedDiseasesWithTieredVariants: [
        {
          gene: 'gene',
          phenotype: 'phenotype',
          tier1: 1,
          tier2: 2,
          tier3: 3
        }
      ],
      diseaseGene: {
        test: 'Test'
      },
      tierSNV: { tier1: 1, tier3: 3, tier2: 2 },
      patient: 'patient',
      fields: [
        {
          filterId: 'filterId',
          instance: ['instance'],
          array: ['array'],
          userAdded: false,
          label: 'label'
        }
      ],
      createdAt: new Date('2021-05-24'),
      updatedAt: new Date('2021-05-26')
    } as unknown) as PatientWorkgroup.Document);
  beforeEach(() => {
    jest.spyOn(PatientWorkgroup, 'count').mockResolvedValue(10);
  });
  afterEach(jest.restoreAllMocks);
  describe('view', () => {
    test('When called, then it should transform PatientWorkgroup properly.', () => {
      const workgroup = getWorkgroup();
      const patientWorkGroup = new PatientWorkgroup(workgroup);
      expect(patientWorkGroup.view()).toMatchObject({
        _id: workgroup._id.toHexString()
      });
    });
  });

  describe('countByWorkgroupAndPatient', () => {
    test('When called, then it should return count.', async () => {
      const result = await PatientWorkgroup.countByWorkgroupAndPatient(new Types.ObjectId(), new Types.ObjectId());
      expect(result).toBe(10);
    });
  });

  describe('countByWorkgroup', () => {
    test('When called, then it it should return count.', async () => {
      const result = await PatientWorkgroup.countByWorkgroup(new Types.ObjectId());
      expect(result).toBe(10);
    });
  });

  describe('getRefererredPatientsCountWithWorkGroup', () => {
    let aggregateSpy: jest.SpyInstance;
    beforeEach(() => {
      aggregateSpy = jest.spyOn(PatientWorkgroup, 'aggregate').mockResolvedValue([
        {
          workgroup: 'test',
          patients: 2
        }
      ]);
    });

    afterEach(jest.restoreAllMocks);
    test('should call the aggregation with valid parameters', async () => {
      const user = new UserBuilder()
        .withName('User')
        .withId(new Types.ObjectId().toHexString())
        .withRbacRoles(ClinicalRole.FieldSpecialist)
        .withRbacRoles(ClinicalRole.ReferringClinician)
        .build();
      const result = await PatientWorkgroup.getRefererredPatientsCountWithWorkGroup(['test'], user);
      expect(result).toEqual([{ patients: 2, workgroup: 'test' }]);
      expect(aggregateSpy).toHaveBeenCalled();
      expect(aggregateSpy).toHaveBeenCalledWith([
        { $match: { workgroup: { $in: ['test'] } } },
        {
          $lookup: {
            as: 'patients',
            from: 'patients',
            let: { patientId: '$patient' },
            pipeline: [
              {
                $match: expect.any(Object)
              }
            ]
          }
        },
        { $project: { _id: 0, patients: { $size: '$patients' }, workgroup: 1 } },
        { $group: { _id: '$workgroup', patients: { $sum: '$patients' } } }
      ]);
    });
  });
});
