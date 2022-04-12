import { ExtractedPatientSampleSchema } from '@schemas';
export const modelName = 'ExtractedPatientSample';

/**
 * MODEL INITIALIZATION
 */

export let ExtractedPatientSample: ExtractedPatientSample.Model;

export const init = (connection: Mongoose.Connection): void => {
  ExtractedPatientSample = connection.model<ExtractedPatientSample.Document, ExtractedPatientSample.Model>(
    modelName,
    ExtractedPatientSampleSchema
  );
};
