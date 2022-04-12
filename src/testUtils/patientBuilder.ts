import { PatientStatus } from '@core/enums';

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

  public build(): Patient.Attributes {
    return this.item as Patient.Attributes;
  }
}
