import path from 'path';

import mongoose from 'mongoose';

import { TeamBuilder } from 'testUtils';

import config from 'config';
import { PatientSampleTypes } from 'enums';

import { SequenceId } from './SequenceId';
import { PatientSample, generateID, getIgvS3BucketPath } from './PatientSample';
import { Patient } from './Patient';
import { SampleQCStatus } from '@core/enums';

describe('PatientSample', () => {
  describe('generateID', () => {
    const mockSequenceIdGetOrCreateNextByName = (value: string): void => {
      SequenceId.getOrCreateNextByName = jest.fn().mockResolvedValue({
        toPadString: () => value
      });
    };

    afterEach(jest.restoreAllMocks);

    test('When called with team, then it should use the team name first letter as prefix.', async () => {
      const sampleType = PatientSampleTypes.BoneMarrow;
      const patient = new Patient({ i: 'P0000001' });
      const team = new TeamBuilder().withName('Team').withId('1').build();
      mockSequenceIdGetOrCreateNextByName('01');
      expect(await generateID({ sampleType, patient, team })).toEqual('T0000001M01');
      expect(SequenceId.getOrCreateNextByName).toHaveBeenCalledTimes(1);
    });

    test('When called without team, then it should use S as prefix.', async () => {
      const sampleType = PatientSampleTypes.BoneMarrow;
      const patient = new Patient({ i: 'P0050001' });
      mockSequenceIdGetOrCreateNextByName('02');
      expect(await generateID({ sampleType, patient })).toEqual('S0050001M02');
      expect(SequenceId.getOrCreateNextByName).toHaveBeenCalledTimes(1);
    });
  });

  describe('view', () => {
    test('When called, then it should transform patient properly.', async () => {
      const userId = new mongoose.Types.ObjectId();
      const user = {
        _id: userId,
        name: 'name',
        surname: 'surname',
        email: 'email',
        picture: 'picture'
      };
      const patientSample = new PatientSample({
        _id: new mongoose.Types.ObjectId(),
        patient: new mongoose.Types.ObjectId(),
        type: PatientSampleTypes.Blood,
        i: 'test-i',
        referenceId: 'test-ref-1',
        sampleId: 'test-sampleId',
        barcode: 'test-barcode',
        igvFile: 'igv1.vcf',
        date: new Date('2021-05-24'),
        owner: new mongoose.Types.ObjectId(),
        createdAt: new Date('2021-05-24'),
        updatedAt: new Date('2021-05-26')
      });
      expect(patientSample.view(user)).toEqual({
        _id: patientSample._id.toHexString(),
        patient: (patientSample.patient as Mongoose.ObjectId).toHexString(),
        sampleId: patientSample.sampleId,
        barcode: patientSample.barcode,
        igvFile: `s3://${path.join(config.clinicalPortal.s3PatientSampleIgvFileBucket, patientSample.igvFile)}`,
        type: patientSample.type,
        i: patientSample.i,
        referenceId: patientSample.referenceId,
        owner: user,
        date: patientSample.date.toISOString(),
        updatedAt: patientSample.updatedAt.toISOString(),
        createdAt: patientSample.createdAt.toISOString()
      });
    });

    test('When called, then it should transform patient properly.', async () => {
      const userId = new mongoose.Types.ObjectId();
      const user = {
        _id: userId,
        name: 'name',
        surname: 'surname',
        email: 'email',
        picture: 'picture'
      };
      const patientSample = new PatientSample({
        _id: new mongoose.Types.ObjectId(),
        patient: new mongoose.Types.ObjectId(),
        type: PatientSampleTypes.Blood,
        i: 'test-i',
        referenceId: 'test-ref-1',
        sampleId: 'test-sampleId',
        barcode: 'test-barcode',
        igvFile: 'igv1.vcf',
        date: new Date('2021-05-24'),
        owner: new mongoose.Types.ObjectId(),
        createdAt: new Date('2021-05-24'),
        updatedAt: new Date('2021-05-26'),
        qcStatusUpdateAt: new Date('2021-05-24'),
        registrationDate: new Date('2021-05-24')
      });
      expect(patientSample.view(user)).toEqual({
        _id: patientSample._id.toHexString(),
        patient: (patientSample.patient as Mongoose.ObjectId).toHexString(),
        sampleId: patientSample.sampleId,
        barcode: patientSample.barcode,
        igvFile: `s3://${path.join(config.clinicalPortal.s3PatientSampleIgvFileBucket, patientSample.igvFile)}`,
        type: patientSample.type,
        i: patientSample.i,
        referenceId: patientSample.referenceId,
        owner: user,
        date: patientSample.date.toISOString(),
        updatedAt: patientSample.updatedAt.toISOString(),
        createdAt: patientSample.createdAt.toISOString(),
        qcJobLink: undefined,
        qcStatus: undefined,
        qcStatusUpdateAt: patientSample.createdAt.toISOString(),
        registrationDate: patientSample.registrationDate.toISOString()
      });
    });
  });

  describe('getIgvS3BucketPath', () => {
    test('When called, should return a proper s3 path', () => {
      const baseUrl = 'testprefixurl';
      const urlPath = 'path-prop/second-pathprop';

      const bucketPath = getIgvS3BucketPath(`${baseUrl}///`, urlPath);

      expect(bucketPath).toBe(`s3://${baseUrl}/${urlPath}`);
    });
  });

  describe('updateById', () => {
    test('should update the sample by ID', async () => {
      const patientSampleAttributes: PatientSample.Attributes = {
        barcode: 'barcode',
        createdAt: new Date(),
        date: new Date(),
        i: 'i',
        igvFile: 'igvFiles',
        labPortalID: 'labPortalID',
        owner: new mongoose.Types.ObjectId(),
        patient: new mongoose.Types.ObjectId(),
        qcJobLink: 'qcJobLink',
        qcStatus: SampleQCStatus.Passed,
        qcStatusUpdateAt: new Date(),
        updatedAt: new Date(),
        referenceId: 'referenceId',
        registrationDate: new Date(),
        sampleId: 'sampleId',
        type: PatientSampleTypes.Blood,
        labPortalSyncFailures: []
      };
      const patientSample = new PatientSample(patientSampleAttributes);
      await patientSample.save();

      const newPatient = await PatientSample.updateById(String(patientSample._id), {
        igvFile: 'newIgvFile'
      });
      expect(newPatient.igvFile).toBe('newIgvFile');
    });
  });
});
