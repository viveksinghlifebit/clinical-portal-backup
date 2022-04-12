declare namespace PatientWorkgroup {
  interface Attributes {
    markers: Array<CorePatient.PatientMarker>;
    comparisonFilters: Array<Filter.FilterId | unknown>;
    workgroup: string | Workgroup.Attributes;
    description: string;
    markersDefinition: Array<GenoMarker.Attributes>;
    igvFiles: Array<string>;
    associatedDiseasesWithTieredVariants: Array<GenoTier.TierDataDiseases>;
    diseaseGene: Record<string, string>;
    tierSNV: GenoTier.TierData;
    patient: string | Patient.Attributes | Patient.View;
    fields: Array<CorePatient.PatientWorkgroupField>;
    createdAt: Date;
    updatedAt: Date;
  }

  interface Document extends Attributes, Mongoose.Document {
    view(): View;
  }

  interface Model extends Mongoose.Model<Document> {
    countByWorkgroupAndPatient(workgroupId: Mongoose.ObjectId, patient: Mongoose.ObjectId): Promise<number>;

    countByWorkgroup(workgroupId: Mongoose.ObjectId): Promise<number>;

    getRefererredPatientsCountWithWorkGroup(
      workgroupIds: string[],
      user: User
    ): Promise<{ workgroup: string; patients: number }[]>;
  }

  interface View {
    _id: string;
    markers: Attributes['markers'];
    comparisonFilters: Attributes['comparisonFilters'];
    workgroup: Attributes['workgroup'];
    description: Attributes['description'];
    markersDefinition: Attributes['markersDefinition'];
    igvFiles: Attributes['igvFiles'];
    associatedDiseasesWithTieredVariants: Attributes['associatedDiseasesWithTieredVariants'];
    diseaseGene: Attributes['diseaseGene'];
    tierSNV: Attributes['tierSNV'];
    patient: Attributes['patient'];
    fields: Attributes['fields'] | PatientWorkgroup.WithValues[];
    createdAt: string;
    updatedAt: string;
  }

  interface WithValues {
    readOnly: boolean;
    filterId?: Filter.FilterId;
    label: string;
    value: string;
    instance?: Array<string>;
    array?: Array<string>;
    instanceNames?: Array<string>;
  }
}
