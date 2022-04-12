import path from 'path';

import config from 'config';
import { PatientSampleTypes } from 'enums';
import { PatientSampleSchema } from '@schemas';

import { SequenceId } from './SequenceId';

export const patientSampleModelName = 'PatientSample';

export const PatientSampleTypesMapping = new Map([
  [PatientSampleTypes.Blood, 'B'],
  [PatientSampleTypes.BuccalSwab, 'W'],
  [PatientSampleTypes.BoneMarrow, 'M'],
  [PatientSampleTypes.BuffyCoat, 'C'],
  [PatientSampleTypes.Saliva, 'S'],
  [PatientSampleTypes.Plasma, 'P'],
  [PatientSampleTypes.FfpeTumor, 'F'],
  [PatientSampleTypes.FfpeNonTumor, 'E'],
  [PatientSampleTypes.FreshFrozenTumor, 'T'],
  [PatientSampleTypes.FreshFrozenNonTumor, 'N'],
  [PatientSampleTypes.FineNeedle, 'D'],
  [PatientSampleTypes.Others, 'Z']
]);

/**
 * MODEL STATICS
 */

export async function generateID({
  sampleType,
  patient,
  team
}: {
  sampleType: PatientSampleTypes;
  patient: Patient.Document;
  team?: Team;
}): Promise<string> {
  let prefix = 'S';
  if (team) {
    // First letter from workspace/team name in upper case
    prefix = team.name.substring(0, 1).toUpperCase();
  }
  // Patient number without prefix letter
  const patientNumber = patient.i.substring(1);
  const specimenNature = PatientSampleTypesMapping.get(sampleType);
  const sequenceId = await SequenceId.getOrCreateNextByName(patient.i);
  const specimenNumber = sequenceId.toPadString(2);

  return `${prefix}${patientNumber}${specimenNature}${specimenNumber}`;
}

async function updateById(
  patientSampleId: string,
  updateData: Partial<Patient.Model>
): Promise<PatientSample.Document | null> {
  return PatientSample.findOneAndUpdate(
    { _id: patientSampleId },
    { $set: updateData },
    { runValidators: true, context: 'query', new: true }
  ).exec();
}

PatientSampleSchema.statics = {
  generateID,
  updateById
};

export const getIgvS3BucketPath = (bucketName: string, igvFileName: string): string => {
  return `s3://${path.join(bucketName, igvFileName)}`;
};

/**
 * MODEL METHODS
 */

function view(this: PatientSample.Document, owner: User): PatientSample.View {
  // TODO: Need to remove qcStatus once we enable SAMPLE_SEQUENCING_LIBRARY_ENABLED
  return {
    _id: this._id.toHexString(),
    patient: (this.patient as Mongoose.ObjectId).toHexString(),
    sampleId: this.sampleId,
    type: this.type,
    barcode: this.barcode,
    igvFile: getIgvS3BucketPath(config.clinicalPortal.s3PatientSampleIgvFileBucket, this.igvFile),
    date: this.date.toISOString(),
    owner,
    i: this.i,
    referenceId: this.referenceId,
    qcStatus: this.qcStatus,
    qcStatusUpdateAt: this.qcStatusUpdateAt ? this.createdAt.toISOString() : undefined,
    qcJobLink: this.qcJobLink,
    createdAt: this.createdAt.toISOString(),
    updatedAt: this.updatedAt.toISOString(),
    registrationDate: this.registrationDate ? this.registrationDate.toISOString() : undefined
  };
}

PatientSampleSchema.methods = {
  view
};

/**
 * MODEL MIDDLEWARES
 */

async function preSave(this: PatientSample.Document): Promise<void> {
  if (this.isNew) {
    this.barcode = this.sampleId;
  }
}

PatientSampleSchema.pre<PatientSample.Document>('save', preSave);

/**
 * MODEL INITIALIZATION
 */

export let PatientSample: PatientSample.Model;

export const init = (connection: Mongoose.Connection): void => {
  PatientSample = connection.model<PatientSample.Document, PatientSample.Model>(
    patientSampleModelName,
    PatientSampleSchema
  );
};
