import { ParentRepository } from './parent/MainRepository';
import * as connection from 'services/mongoose/connections';

export class MedicalValueRepository extends ParentRepository {
  static searchByTerm(fieldId: Filter.FilterId, term = ''): Promise<MedicalValueRepository.Attributes[]> {
    return connection.clinicalPortalConnection
      .collection('medicalValues')
      .find({
        f: fieldId,
        v: { $regex: new RegExp(term), $options: 'i' }
      })
      .toArray() as Promise<MedicalValueRepository.Attributes[]>;
  }
}
