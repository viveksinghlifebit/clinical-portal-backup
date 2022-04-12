import { SampleQCStatus } from '@core/enums';
import mongoose from 'mongoose';
import { PatientSampleSequencingLibrary } from './PatientSampleSequencingLibrary';

describe('PatientSampleSequencingLibrary', () => {
  describe('view', () => {
    test('should provide the view of the patientSampleSequencingLibrary without qcStatusUpdatedAt', () => {
      const userId = new mongoose.Types.ObjectId();
      const user = {
        _id: userId,
        name: 'name',
        surname: 'surname',
        email: 'email',
        picture: 'picture'
      };
      const patientSampleSequencingLibrary = {
        _id: new mongoose.Types.ObjectId(),
        sample: new mongoose.Types.ObjectId(),
        patient: new mongoose.Types.ObjectId(),
        sampleId: 'sampleId',
        sequencingId: 'sequencingId',
        libraryNumber: 'libraryNumber',
        igvFile: 'igv1.vcf',
        i: 'i',
        operator: 'operator',
        labPortalID: 'labPortalId',
        qcJobLink: 'qcJobLink',
        qcStatus: SampleQCStatus.Passed,
        date: new Date('2021-05-24'),
        owner: user,
        createdAt: new Date('2021-05-24'),
        updatedAt: new Date('2021-05-26')
      };

      expect(new PatientSampleSequencingLibrary(patientSampleSequencingLibrary).view(user)).toStrictEqual({
        ...patientSampleSequencingLibrary,
        _id: patientSampleSequencingLibrary._id.toHexString(),
        sample: patientSampleSequencingLibrary.sample.toHexString(),
        patient: patientSampleSequencingLibrary.patient.toHexString(),
        sampleId: patientSampleSequencingLibrary.sequencingId,
        updatedAt: patientSampleSequencingLibrary.updatedAt.toISOString(),
        qcStatusUpdateAt: undefined,
        createdAt: patientSampleSequencingLibrary.createdAt.toISOString(),
        date: patientSampleSequencingLibrary.date.toISOString(),
        igvFile: 's3://s3:/igv/outputs/igv1.vcf'
      });
    });

    test('should provide the view of the patientSampleSequencingLibrary with qcStatusUpdatedAt', () => {
      const userId = new mongoose.Types.ObjectId();
      const user = {
        _id: userId,
        name: 'name',
        surname: 'surname',
        email: 'email',
        picture: 'picture'
      };
      const patientSampleSequencingLibrary = {
        _id: new mongoose.Types.ObjectId(),
        sample: new mongoose.Types.ObjectId(),
        patient: new mongoose.Types.ObjectId(),
        sampleId: 'sampleId',
        sequencingId: 'sequencingId',
        libraryNumber: 'libraryNumber',
        igvFile: 'igv1.vcf',
        i: 'i',
        operator: 'operator',
        labPortalID: 'labPortalId',
        qcJobLink: 'qcJobLink',
        qcStatus: SampleQCStatus.Passed,
        date: new Date('2021-05-24'),
        owner: user,
        createdAt: new Date('2021-05-24'),
        updatedAt: new Date('2021-05-26'),
        qcStatusUpdateAt: new Date('2021-05-24')
      };

      expect(new PatientSampleSequencingLibrary(patientSampleSequencingLibrary).view(user)).toStrictEqual({
        ...patientSampleSequencingLibrary,
        _id: patientSampleSequencingLibrary._id.toHexString(),
        sample: patientSampleSequencingLibrary.sample.toHexString(),
        patient: patientSampleSequencingLibrary.patient.toHexString(),
        sampleId: patientSampleSequencingLibrary.sequencingId,
        updatedAt: patientSampleSequencingLibrary.updatedAt.toISOString(),
        qcStatusUpdateAt: patientSampleSequencingLibrary.qcStatusUpdateAt.toISOString(),
        createdAt: patientSampleSequencingLibrary.createdAt.toISOString(),
        date: patientSampleSequencingLibrary.date.toISOString(),
        igvFile: 's3://s3:/igv/outputs/igv1.vcf'
      });
    });
  });
});
