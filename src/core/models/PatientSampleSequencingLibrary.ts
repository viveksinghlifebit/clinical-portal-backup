import config from 'config';
import { PatientSampleSequencingLibrarySchema } from '@schemas';
import { getIgvS3BucketPath } from './PatientSample';

export const patientSampleSequencingLibraryModelName = 'PatientSampleSequencingLibrary';

/**
 * MODEL METHODS
 */

function view(this: PatientSampleSequencingLibrary.Document, owner: User): PatientSampleSequencingLibrary.View {
  return {
    _id: this._id.toHexString(),
    sample: this.sample.toHexString(),
    sampleId: this.sequencingId,
    patient: this.patient.toHexString(),
    sequencingId: this.sequencingId,
    libraryNumber: this.libraryNumber,
    date: this.date.toISOString(),
    igvFile: getIgvS3BucketPath(config.clinicalPortal.s3PatientSampleIgvFileBucket, this.igvFile),
    owner,
    i: this.i,
    createdAt: this.createdAt.toISOString(),
    operator: this.operator,
    updatedAt: this.updatedAt.toISOString(),
    labPortalID: this.labPortalID,
    qcJobLink: this.qcJobLink,
    qcStatus: this.qcStatus,
    qcStatusUpdateAt: this.qcStatusUpdateAt ? this.createdAt.toISOString() : undefined
  };
}

PatientSampleSequencingLibrarySchema.methods = {
  view
};

/**
 * MODEL INITIALIZATION
 */

export let PatientSampleSequencingLibrary: PatientSampleSequencingLibrary.Model;

export const init = (connection: Mongoose.Connection): void => {
  PatientSampleSequencingLibrary = connection.model<
    PatientSampleSequencingLibrary.Document,
    PatientSampleSequencingLibrary.Model
  >(patientSampleSequencingLibraryModelName, PatientSampleSequencingLibrarySchema);
};
