import { isEmpty } from 'lodash';

import { SequenceIdNames } from 'enums';
import {
  searchableEncryptedFields,
  AddressSchema,
  NextOfKinsSchema,
  DateOfBirthSchema,
  PatientSchema,
  addressSchemaRaw,
  nextOfKinsSchemaRaw
} from '@schemas';
import { SequenceId } from './SequenceId';

const patientModelName = 'Patient';

/**
 * MODEL STATICS
 */

export async function generateID(): Promise<string> {
  const sequenceId = await SequenceId.getNextByName(SequenceIdNames.Patient);
  return sequenceId.toPadString();
}

export function dateOfBirthFromString(value: string): Patient.Attributes['dateOfBirth'] {
  const date = new Date(value);
  return {
    year: date.getFullYear().toString(),
    month: (date.getMonth() + 1).toString(),
    day: date.getDate().toString()
  };
}

async function updateById(
  patientId: string,
  updateData: Partial<Patient.Model>
): Promise<
  | (Patient.Document & {
      _id: Mongoose.ObjectId;
    })
  | null
> {
  return Patient.findOneAndUpdate(
    { _id: patientId },
    { $set: updateData },
    { runValidators: true, context: 'query', new: true }
  ).exec();
}

function getSearchableEncryptedFields(): string[] {
  return searchableEncryptedFields;
}

PatientSchema.statics = {
  generateID,
  dateOfBirthFromString,
  updateById,
  getSearchableEncryptedFields
};

const mapAddressProperties = (
  address: Patient.Address
): { address1: string; address2: string; area: string; cityAndCountry: string } => ({
  address1: address.address1,
  address2: address.address2,
  area: address.area,
  cityAndCountry: address.cityAndCountry
});
/**
 * MODEL METHODS
 */

function view(this: Patient.Document): Patient.View {
  const { dateOfBirth } = this.toJSON();
  const dateOfBirthToUse = (dateOfBirth as unknown) as { year: number; month: number; day: number };
  return {
    _id: this._id.toHexString(),
    i: this.i,
    externalID: this.externalID,
    externalIDType: this.externalIDType,
    status: this.status,
    subStatus: this.subStatus,
    name: this.name,
    surname: this.surname,
    chineseName: this.chineseName,
    chineseSurname: this.chineseSurname,
    dateOfBirth: !isEmpty(dateOfBirthToUse)
      ? new Date(`${dateOfBirthToUse.year}-${dateOfBirthToUse.month}-${dateOfBirthToUse.day}`).toISOString()
      : undefined,
    email: this.email,
    phoneNumber: this.phoneNumber,
    addresses: this.addresses.map(mapAddressProperties),
    familyId: this.familyId ? this.familyId.toHexString() : undefined,
    owner: this.owner.toHexString(),
    team: this.team ? this.team.toHexString() : undefined,
    images: this.images,
    reports: this.reports,
    associatedDiseasesWithTieredVariants: this.associatedDiseasesWithTieredVariants,
    diseaseGene: this.diseaseGene,
    nextsOfKin: this.nextsOfKin?.map((nextOfKin) => ({
      name: nextOfKin.name,
      email: nextOfKin.email,
      phoneNumber: nextOfKin.phoneNumber,
      addresses: nextOfKin.addresses?.map(mapAddressProperties),
      relationship: nextOfKin.relationship
    })),
    analysisEligibleTypes: this.analysisEligibleTypes,
    createdAt: this.createdAt.toISOString(),
    updatedAt: this.updatedAt.toISOString(),
    analysisEligibleTypesOthers: this.analysisEligibleTypesOthers,
    updatedBy: this.updatedBy ? this.updatedBy.toHexString() : this.owner.toHexString(),
    referringUsers: this.referringUsers
  };
}

// don't overwrite the whole .methods object, instead add the view method to it
// because schema.methods is also used by the mongoose-encrypt-field plugin
PatientSchema.methods.view = view;

export function saveEncrypted(this: Patient.Document): Promise<Patient.Document> {
  // Use the .saveEncrypted() method instead of the .save() when,
  // you want to call .save() on a patient document which had been,
  // returned by .find or .findOne.
  // The .saveEncrypted() method exlcudes any metadata fields used for en/de-cryption.
  // We need it because if these metadata are present,
  // for nested encrypted mongoose documents of array type,
  // then the .save can fail with error "MongoError: Cannot create field '-1' in element ..."
  // and the .saveEncrypted method prevents that.
  const mapAddress = (address: Record<string, unknown>): Patient.Address => {
    return Object.keys(addressSchemaRaw).reduce((acc, key) => {
      acc[key] = address[key];
      return acc;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, {} as any);
  };
  this.addresses = this.addresses.map(mapAddress);
  this.nextsOfKin = this.nextsOfKin.map(
    (nextOfKin: Patient.NextOfKin): Patient.NextOfKin => {
      const obj: Partial<Patient.Attributes> = Object.keys(nextOfKinsSchemaRaw).reduce((acc, key) => {
        acc[key] = nextOfKin[key as keyof Patient.NextOfKin];
        return acc;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }, {} as any);
      obj.addresses = nextOfKin.addresses.map(mapAddress);
      return obj as Patient.NextOfKin;
    }
  );
  return this.save();
}
PatientSchema.method('saveEncrypted', saveEncrypted);

/**
 * MODEL MIDDLEWARES
 */

export async function preSave(this: Patient.Document): Promise<void> {
  if (this.isNew) this.i = await Patient.generateID();
  if (!this.updatedBy) this.updatedBy = this.owner;
}

PatientSchema.pre<Patient.Document>('save', preSave);

export function postSave(this: Patient.Document): void {
  if (this.decryptFieldsSync) {
    this.decryptFieldsSync();
  }
}

PatientSchema.post<Patient.Document>('save', postSave);
AddressSchema.post('save', postSave);
NextOfKinsSchema.post('save', postSave);
DateOfBirthSchema.post('save', postSave);

/**
 * MODEL INITIALIZATION
 */

export let Patient: Patient.Model;

export const init = (connection: Mongoose.Connection): void => {
  Patient = connection.model<Patient.Document, Patient.Model>(patientModelName, PatientSchema);
};
