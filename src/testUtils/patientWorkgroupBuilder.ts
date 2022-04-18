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
