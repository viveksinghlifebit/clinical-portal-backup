import { PatientWorkgroup } from '@core/models';

export class PatientWorkgroupBuilder {
  private readonly item: Partial<PatientWorkgroup.Document>;

  constructor() {
    this.item = {};
  }

  public withId(id: string): PatientWorkgroupBuilder {
    this.item._id = id;
    return this;
  }

  public withWorkgroup(workgroup: Workgroup.Attributes): PatientWorkgroupBuilder {
    this.item.workgroup = workgroup;
    return this;
  }

  public withPatient(patient: Patient.Attributes): PatientWorkgroupBuilder {
    this.item.patient = patient;
    return this;
  }

  public build(): PatientWorkgroup.Document {
    return this.item as PatientWorkgroup.Document;
  }
}

export const createPatientWorkgroupInDB = (
  entity: Pick<PatientWorkgroup.Attributes, 'patient' | 'workgroup' | 'fields'>
): Promise<PatientWorkgroup.Document> => {
  return PatientWorkgroup.create({
    markersDefinition: [],
    igvFiles: [],
    associatedDiseasesWithTieredVariants: [],
    comparisonFilters: [],
    description: 'default',
    workgroup: entity.workgroup,
    patient: entity.patient,
    markers: [],
    fields: entity.fields ?? [],
    createdAt: new Date('2021-07-26T10:28:12.302Z'),
    updatedAt: new Date('2021-07-26T10:28:12.390Z'),
    tierSNV: { tier1: 0, tier2: 0, tier3: 0 }
  });
};
