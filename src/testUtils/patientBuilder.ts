import { PatientStatus } from '@core/enums';
import { Patient, SequenceId } from '@core/models';
import mongoose from 'mongoose';

export class PatientBuilder {
  private readonly item: Partial<Patient.Document>;

  constructor() {
    this.item = {};
  }

  public withId(id: Mongoose.ObjectId): PatientBuilder {
    this.item._id = id;
    return this;
  }

  public withAddress(addresses: Patient.Address[]): PatientBuilder {
    this.item.addresses = addresses;
    return this;
  }

  public withI(i: string): PatientBuilder {
    this.item.i = i;
    return this;
  }

  public withExternalID(externalID: string): PatientBuilder {
    this.item.externalID = externalID;
    return this;
  }

  public withExternalIDType(externalIDType: string): PatientBuilder {
    this.item.externalIDType = externalIDType;
    return this;
  }

  public withStatus(status: PatientStatus): PatientBuilder {
    this.item.status = status;
    return this;
  }

  public withName(name: string): PatientBuilder {
    this.item.name = name;
    return this;
  }

  public withSurname(surname: string): PatientBuilder {
    this.item.surname = surname;
    return this;
  }

  public withLabPortalId(labPortalId: string): PatientBuilder {
    this.item.labPortalID = labPortalId;
    return this;
  }

  public withOwner(userId: Mongoose.ObjectId): PatientBuilder {
    this.item.owner = userId;
    return this;
  }

  public build(): Patient.Document {
    return this.item as Patient.Document;
  }
}

export const basicPatient = (userId: string): Patient.Document => {
  return new PatientBuilder()
    .withI('P01')
    .withId(new mongoose.Types.ObjectId())
    .withName('name')
    .withSurname('surname')
    .withLabPortalId('MockedId')
    .withOwner(new mongoose.Types.ObjectId(userId))
    .build();
};

export const createSequenceIfNotPresent = async (): Promise<void> => {
  const sequence = { _id: new mongoose.Types.ObjectId(), name: 'patient', value: 1, prefix: 'P' };
  const sequenceExists = await SequenceId.findOne({ name: 'patient' });
  if (!sequenceExists) {
    await SequenceId.create(sequence);
  }
};

export const createPatientInDB = async (
  patient: Patient.Document,
  userId: string,
  teamId: string
): Promise<Patient.Document> => {
  await createSequenceIfNotPresent();
  return Patient.create({
    ...patient,
    team: teamId,
    status: PatientStatus.Enrolled,
    updatedBy: new mongoose.Types.ObjectId(userId),
    externalIDType: 'Passport',
    externalID: 'externalId'
  });
};
