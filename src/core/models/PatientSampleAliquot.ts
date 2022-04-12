import { PatientSampleAliquotSchema } from '@schemas';
export const modelName = 'PatientSampleAliquot';

/**
 * MODEL INITIALIZATION
 */

export let PatientSampleAliquot: PatientSampleAliquot.Model;

export const init = (connection: Mongoose.Connection): void => {
  PatientSampleAliquot = connection.model<PatientSampleAliquot.Document, PatientSampleAliquot.Model>(
    modelName,
    PatientSampleAliquotSchema
  );
};
