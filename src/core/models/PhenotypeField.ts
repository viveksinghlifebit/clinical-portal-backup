import { PhenotypeFieldSchema } from '@schemas';
const modelName = 'PhenotypeField';

/**
 * MODEL INITIALIZATION
 */
export let PhenotypeField: PhenotypeField.Model;

export const init = (connection: Mongoose.Connection): void => {
  PhenotypeField = connection.model<PhenotypeField.Document, PhenotypeField.Model>(modelName, PhenotypeFieldSchema);
};
