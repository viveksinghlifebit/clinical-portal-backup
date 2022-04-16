import mongoose from 'mongoose';

import { PatientStatus, SampleAnalysisTypes } from 'enums';

import { SequenceId } from './SequenceId';
import { Patient, generateID, preSave, postSave, generateHospitalRef } from './Patient';
import { TeamPrefixesService } from 'services/team-prefixes/TeamPrefixesService';

describe('Patient', () => {
  afterAll(jest.restoreAllMocks);
  describe('getSearchableEncryptedFields', () => {
    test('should return searchableEncryptedFields', () => {
      const result = Patient.getSearchableEncryptedFields?.();
      expect(result).toEqual([
        'externalID',
        'name',
        'surname',
        'chineseName',
        'chineseSurname',
        'email',
        'phoneNumber',
        'dateOfBirth.year'
      ]);
    });
  });

  describe('updateById', () => {
    let spyPatientFindOneAndUpdate: jest.SpyInstance;
    beforeEach(() => {
      spyPatientFindOneAndUpdate = jest.spyOn(Patient, 'findOneAndUpdate');
    });

    afterEach(jest.restoreAllMocks);
    test('should return the patient', async () => {
      spyPatientFindOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(undefined)
      });
      await expect(Patient.updateById('id', { name: 'test' })).toMatchObject({});
    });
  });
  describe('generateID', () => {
    afterAll(jest.restoreAllMocks);
    const mockSequenceIdGetNextByName = (value: string): void => {
      const spySequence: jest.SpyInstance = jest.spyOn(SequenceId, 'getNextByName');
      spySequence.mockResolvedValue({
        toPadString: () => value
      });
    };

    afterEach(jest.restoreAllMocks);

    test('When called and a doc is found, then it call incrementID fn.', async () => {
      const i = 'P0000000001';
      mockSequenceIdGetNextByName(i);
      expect(await generateID()).toEqual(i);
      expect(SequenceId.getNextByName).toHaveBeenCalledTimes(1);
    });
  });

  describe('preSave', () => {
    beforeEach(() => {
      jest.spyOn(Patient, 'generateID').mockResolvedValue('P0000000000');
    });

    afterEach(jest.restoreAllMocks);

    test('When its a new document, then it should call proper methods.', async () => {
      await preSave.bind({ isNew: true } as Patient.Document)();
      expect(Patient.generateID).toHaveBeenCalledTimes(1);
    });

    test('When its a new document, then it should call proper methods.', async () => {
      await preSave.bind({ isNew: false } as Patient.Document)();
      expect(Patient.generateID).not.toHaveBeenCalled();
    });
  });

  describe('postSave', () => {
    test('When the doc contains the decryptFieldsSync method that sould be called', () => {
      const doc = ({ decryptFieldsSync: () => null } as unknown) as Patient.Document;
      const decryptFieldsSyncSpy = jest.spyOn(doc, 'decryptFieldsSync');

      postSave.bind(doc)();

      expect(decryptFieldsSyncSpy).toBeCalledTimes(1);
    });

    test('When the doc does not contain the decryptFieldsSync method then it should not throw err', () => {
      postSave.bind({} as Patient.Document);
    });
  });

  describe('view', () => {
    test('When called, then it should transform patient properly.', async () => {
      const dateOfBirth = new Date('1986-09-15');
      const patient = new Patient({
        _id: new mongoose.Types.ObjectId(),
        i: 'test-i',
        externalID: 'test-externalID',
        externalIDType: 'test-externalIDType',
        status: PatientStatus.Drafted,
        hospitalRef: 'test',
        name: 'test-name',
        surname: 'test-surname',
        chineseName: 'test-chineseName',
        chineseSurname: 'test-chineseSurname',
        dateOfBirth: Patient.dateOfBirthFromString(dateOfBirth.toISOString()),
        email: 'test-email',
        phoneNumber: 'test-phoneNumber',
        addresses: [
          {
            address1: 'test-address1',
            address2: 'test-address2',
            cityAndCountry: 'test-cityAndCountry',
            area: 'test-area'
          },
          {
            address1: 'another-test-address1',
            address2: 'another-test-address2',
            cityAndCountry: 'another-test-cityAndCountry',
            area: 'another-test-area'
          }
        ],
        familyId: new mongoose.Types.ObjectId(),
        owner: new mongoose.Types.ObjectId(),
        team: new mongoose.Types.ObjectId(),
        images: [],
        reports: [],
        associatedDiseasesWithTieredVariants: [],
        diseaseGene: [],
        nextsOfKin: [
          {
            name: 'Alice',
            email: 'alice@lifebit.ai',
            phoneNumber: '0000',
            addresses: [
              {
                address1: 'address1',
                address2: 'address2',
                cityAndCountry: 'city',
                area: 'area'
              }
            ],
            relationship: 'Mother'
          },
          {
            name: 'Alice',
            email: 'alice@lifebit.ai',
            phoneNumber: '0000',
            relationship: 'Mother'
          }
        ],
        analysisEligibleTypes: [SampleAnalysisTypes.Trio],
        createdAt: new Date('2021-05-24'),
        updatedAt: new Date('2021-05-26'),
        lastExportAt: new Date('2021-05-26')
      });
      expect(patient.view()).toEqual({
        _id: patient._id.toHexString(),
        i: patient.i,
        externalID: patient.externalID,
        externalIDType: patient.externalIDType,
        status: patient.status,
        name: patient.name,
        surname: patient.surname,
        chineseName: patient.chineseName,
        chineseSurname: patient.chineseSurname,
        dateOfBirth: expect.any(String),
        subStatus: undefined,
        email: patient.email,
        phoneNumber: patient.phoneNumber,
        addresses: [
          {
            address1: patient.addresses[0]?.address1,
            address2: patient.addresses[0]?.address2,
            cityAndCountry: patient.addresses[0]?.cityAndCountry,
            area: patient.addresses[0]?.area
          },
          {
            address1: patient.addresses[1]?.address1,
            address2: patient.addresses[1]?.address2,
            cityAndCountry: patient.addresses[1]?.cityAndCountry,
            area: patient.addresses[1]?.area
          }
        ],
        referringUsers: expect.any(Array),
        analysisEligibleTypesOthers: undefined,
        familyId: patient.familyId.toHexString(),
        owner: patient.owner.toHexString(),
        team: patient.team.toHexString(),
        images: patient.images,
        reports: patient.reports,
        associatedDiseasesWithTieredVariants: patient.associatedDiseasesWithTieredVariants,
        diseaseGene: patient.diseaseGene,
        nextsOfKin: [
          {
            name: patient.nextsOfKin[0]?.name,
            email: patient.nextsOfKin[0]?.email,
            phoneNumber: patient.nextsOfKin[0]?.phoneNumber,
            addresses: [
              {
                address1: patient.nextsOfKin[0]?.addresses[0]?.address1,
                address2: patient.nextsOfKin[0]?.addresses[0]?.address2,
                cityAndCountry: patient.nextsOfKin[0]?.addresses[0]?.cityAndCountry,
                area: patient.nextsOfKin[0]?.addresses[0]?.area
              }
            ],
            relationship: patient.nextsOfKin[0]?.relationship
          },
          {
            name: patient.nextsOfKin[0]?.name,
            email: patient.nextsOfKin[0]?.email,
            phoneNumber: patient.nextsOfKin[0]?.phoneNumber,
            addresses: [],
            relationship: patient.nextsOfKin[0]?.relationship
          }
        ],
        analysisEligibleTypes: patient.analysisEligibleTypes,
        createdAt: patient.createdAt.toISOString(),
        updatedAt: patient.updatedAt.toISOString(),
        updatedBy: patient.owner.toHexString(),
        lastExportAt: patient.lastExportAt?.toISOString(),
        hospitalRef: patient.hospitalRef
      });
    });

    test('When called, then it should transform patient properly with undefined values as well', async () => {
      const patient = new Patient({
        _id: new mongoose.Types.ObjectId(),
        i: 'test-i',
        externalID: 'test-externalID',
        externalIDType: 'test-externalIDType',
        status: PatientStatus.Drafted,
        name: 'test-name',
        surname: 'test-surname',
        chineseName: 'test-chineseName',
        chineseSurname: 'test-chineseSurname',
        dateOfBirth: undefined,
        email: 'test-email',
        phoneNumber: 'test-phoneNumber',
        addresses: [],
        nextsOfKin: undefined,
        owner: new mongoose.Types.ObjectId(),
        images: [],
        reports: [],
        associatedDiseasesWithTieredVariants: [],
        updatedBy: new mongoose.Types.ObjectId(),
        diseaseGene: [],
        analysisEligibleTypes: [SampleAnalysisTypes.Trio],
        createdAt: new Date('2021-05-24'),
        updatedAt: new Date('2021-05-26')
      });
      expect(patient.view()).toEqual({
        _id: patient._id.toHexString(),
        i: patient.i,
        team: undefined,
        dateOfBirth: undefined,
        familyId: undefined,
        externalID: patient.externalID,
        externalIDType: patient.externalIDType,
        status: patient.status,
        name: patient.name,
        surname: patient.surname,
        chineseName: patient.chineseName,
        chineseSurname: patient.chineseSurname,
        subStatus: undefined,
        email: patient.email,
        phoneNumber: patient.phoneNumber,
        addresses: [],
        referringUsers: expect.any(Array),
        analysisEligibleTypesOthers: undefined,
        owner: patient.owner.toHexString(),
        images: patient.images,
        reports: patient.reports,
        associatedDiseasesWithTieredVariants: patient.associatedDiseasesWithTieredVariants,
        diseaseGene: patient.diseaseGene,
        nextsOfKin: [],
        analysisEligibleTypes: patient.analysisEligibleTypes,
        createdAt: patient.createdAt.toISOString(),
        updatedAt: patient.updatedAt.toISOString(),
        updatedBy: patient.updatedBy.toHexString()
      });
    });

    test('save should call the nextOfKin and address', async () => {
      const sequence = { _id: new mongoose.Types.ObjectId(), name: 'patient', value: 1, prefix: 'P' };

      await SequenceId.create(sequence);
      const patient = {
        _id: new mongoose.Types.ObjectId(),
        i: 'test-i',
        externalID: 'test-externalID-1',
        externalIDType: 'test-externalIDType',
        status: PatientStatus.Drafted,
        name: 'test-name',
        surname: 'test-surname',
        chineseName: 'test-chineseName',
        chineseSurname: 'test-chineseSurname',
        dateOfBirth: undefined,
        email: 'test-email',
        phoneNumber: 'test-phoneNumber',
        addresses: [],
        nextsOfKin: undefined,
        owner: new mongoose.Types.ObjectId(),
        images: [],
        reports: [],
        associatedDiseasesWithTieredVariants: [],
        updatedBy: new mongoose.Types.ObjectId(),
        diseaseGene: [],
        analysisEligibleTypes: [SampleAnalysisTypes.Trio],
        createdAt: new Date('2021-05-24'),
        updatedAt: new Date('2021-05-26')
      };

      const patient2 = await new Patient({
        ...patient,
        i: 'test-2',
        externalID: 'test-externalID-2',
        _id: new mongoose.Types.ObjectId(),
        addresses: [
          {
            address1: 'test-address1',
            address2: 'test-address2',
            cityAndCountry: 'test-cityAndCountry',
            area: 'test-area'
          },
          {
            address1: 'another-test-address1',
            address2: 'another-test-address2',
            cityAndCountry: 'another-test-cityAndCountry',
            area: 'another-test-area'
          }
        ],
        nextsOfKin: [
          {
            name: 'Alice',
            email: 'alice@lifebit.ai',
            phoneNumber: '0000',
            addresses: [
              {
                address1: 'address1',
                address2: 'address2',
                cityAndCountry: 'city',
                area: 'area'
              }
            ],
            relationship: 'Mother'
          },
          {
            name: 'Alice',
            email: 'alice@lifebit.ai',
            phoneNumber: '0000',
            relationship: 'Mother'
          }
        ]
      }).save();

      const patient1 = await new Patient(patient).save();

      expect(patient1).toHaveProperty('__v');
      expect(patient2).toHaveProperty('__v');
    });
  });

  describe('generateHospitalRef', () => {
    let teamPrefixSpy: jest.SpyInstance;
    beforeEach(() => {
      teamPrefixSpy = jest.spyOn(TeamPrefixesService, 'get');
    });

    test('should return undefined if teamId is not present', async () => {
      teamPrefixSpy.mockResolvedValueOnce(undefined);
      expect(await generateHospitalRef('test')).toBe(undefined);
    });

    test('should return undefined if teamId is undefined', async () => {
      expect(await generateHospitalRef((undefined as unknown) as string)).toBe(undefined);
    });

    test('should return "TEST-PREFIXpadstring" if teamId is not present', async () => {
      teamPrefixSpy.mockResolvedValueOnce({
        test: 'test-prefix'
      });
      const spySequenceGetOrCreate: jest.SpyInstance = jest.spyOn(SequenceId, 'getOrCreateNextByName');
      spySequenceGetOrCreate.mockResolvedValueOnce({
        toPadString: () => 'padstring'
      });
      expect(await generateHospitalRef('test')).toBe('TEST-PREFIXpadstring');
    });
  });
});
