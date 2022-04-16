import { isEmpty } from 'lodash';

import { SequenceIdNames } from '../../enums';
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
import { TeamPrefixesService } from 'services/team-prefixes/TeamPrefixesService';

export const patientModelName = 'Patient';

// the length of the number part of the hospital ref
const HOSPITAL_REF_SEQUENCE_LENGTH = 6;

/**
 * Returns the hospital/team prefix.
 * e.g. PW, QM, CH etc...
 */
export async function getHospitalPrefix(teamId: string): Promise<string | undefined> {
  const teamPrefixes = await TeamPrefixesService.get();
  if (!teamPrefixes || !teamPrefixes[teamId]) return undefined;

  return teamPrefixes[teamId]?.toUpperCase();
}

/**
 * MODEL STATICS
 */

export async function generateID(): Promise<string> {
  const sequenceId = await SequenceId.getNextByName(SequenceIdNames.Patient);
  return sequenceId.toPadString();
}

/**
 * Returns the correct next hospital ref number for the specified hospital(workspace/team)
 * e.g. PW001234
 *
 * NOTE:
 * For each hospital there is a different sequence name (if not then should be created), so first we need
 * to get the correct sequence for the patient's team.
 *
 * e.g. sequence document for Prince of Wales (in db.sequenceids)
 * {
 *    _id: 609a7388644abc1b9c91efca
 *    name: PatientHospitalRef_PW    (with hospital prefix added)
 *    value: 001234
 * }
 *
 *
 * @param teamId
 * @returns
 */
export async function generateHospitalRef(teamId: string): Promise<string | undefined> {
  const prefix = teamId ? await getHospitalPrefix(teamId) : undefined;
  if (prefix) {
    // build the sequence name to find/create, using the predefined name and the hospital prefix
    const sequenceName = `${SequenceIdNames.PatientHospitalRef}_${prefix}`;
    const sequenceId = await SequenceId.getOrCreateNextByName(sequenceName);
    return `${prefix}${sequenceId.toPadString(HOSPITAL_REF_SEQUENCE_LENGTH)}`;
  }
  return undefined;
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

const mapAddressProperties = (
  address: Patient.Address
): { address1: string; address2: string; area: string; cityAndCountry: string } => ({
  address1: address.address1,
  address2: address.address2,
  area: address.area,
  cityAndCountry: address.cityAndCountry
});

PatientSchema.statics = {
  generateID,
  generateHospitalRef,
  dateOfBirthFromString,
  updateById,
  getSearchableEncryptedFields
};

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
    hospitalRef: this.team && this.hospitalRef ? this.hospitalRef : undefined,
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
    familyId: this.familyId?.toHexString(),
    owner: this.owner.toHexString(),
    team: this.team?.toHexString(),
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
    updatedBy: this.updatedBy?.toHexString() ?? this.owner.toHexString(),
    referringUsers: this.referringUsers,
    lastExportAt: this.lastExportAt?.toISOString(),
    labPortalID: this.labPortalID
  };
}

// don't overwrite the whole .methods object, instead add the view method to it
// because schema.methods is also used by the mongoose-encrypt-field plugin
PatientSchema.methods.view = view;

/**
 * MODEL MIDDLEWARES
 */

export async function preSave(this: Patient.Document): Promise<void> {
  if (this.isNew) {
    this.i = await Patient.generateID();
    this.hospitalRef = this.team ? await Patient.generateHospitalRef(this.team.toHexString()) : undefined;
  }
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

const keepOnlyAddressSchemaProps = (address: Patient.Address): Patient.Address => {
  const keys = Object.keys(addressSchemaRaw) as (keyof Patient.Address)[];
  return keys.reduce((acc, key) => {
    acc[key] = address[key];
    return acc;
  }, {} as Patient.Address);
};
const keepOnlyNextsOfKinSchemaProps = (nextOfKin: Patient.NextOfKin): Partial<Patient.Attributes> => {
  const obj: Partial<Patient.Attributes> = Object.keys(nextOfKinsSchemaRaw).reduce((acc, key) => {
    acc[key] = nextOfKin[key as keyof Patient.NextOfKin];
    return acc;
  }, {} as any);
  obj.addresses = nextOfKin.addresses.map(keepOnlyAddressSchemaProps);
  return obj;
};
export const init = (connection: Mongoose.Connection): void => {
  Patient = connection.model<Patient.Document, Patient.Model>(patientModelName, PatientSchema);
  Patient.prototype.save = new Proxy(Patient.prototype.save, {
    apply: function (target, that, args) {
      // keep only the declared schema properties for nested encrypted data.
      // Because the encryption plugin inserts some metadata: `__enc_*: boolean` in the nested objects,
      // which cause the save to throw error,
      // when a save is called on an encrypted document that have been retrieved from the database.
      // I use a proxy because neither a pre save hook solves the problem.
      if (that.addresses) that.addresses = that.addresses.map(keepOnlyAddressSchemaProps);
      if (that.nextsOfKin) that.nextsOfKin = that.nextsOfKin.map(keepOnlyNextsOfKinSchemaProps);
      return target.apply(that, args);
    }
  });
};
