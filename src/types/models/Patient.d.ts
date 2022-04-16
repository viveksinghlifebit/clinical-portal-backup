declare namespace Patient {
  interface Attributes {
    i: string;
    externalID: string;
    externalIDType: string;
    hospitalRef?: string;
    status: PatientStatus;
    subStatus?: PatientSubStatus;
    name: string;
    surname: string;
    chineseName: string;
    chineseSurname: string;
    dateOfBirth: { year: string; month: string; day: string } | string;
    email: string;
    phoneNumber: string;
    addresses: Address[];
    familyId: Mongoose.ObjectId;
    owner: Mongoose.ObjectId;
    team: Mongoose.ObjectId;
    consentForms: ConsentForm[];
    // TODO: improve schema once implemented
    images: { location: string }[];
    // TODO: improve schema once implemented
    reports: { location: string }[];
    associatedDiseasesWithTieredVariants: GenoTier.TierDataDiseases[];
    diseaseGene: Record<string, string>;
    labPortalID: string;
    nextsOfKin: NextOfKin[];
    analysisEligibleTypes: import('enums').SampleAnalysisTypes[];
    createdAt: Date;
    updatedAt: Date;
    decryptFieldsSync?: () => undefined;
    encryptFieldsSync?: () => undefined;
    analysisEligibleTypesOthers: string;
    referringUsers?: ReferringUser[];
    updatedBy: Mongoose.ObjectId;
    dateOfEnrollment?: Date;
    labPortalSyncFailures?: LabPortalFailure[];
    lastExportAt?: Date;
  }

  interface LabPortalFailure {
    reason: string;
    date: Date;
  }
  interface Document extends Attributes, Mongoose.Document {
    view(): View;
  }

  interface Model extends Mongoose.Model<Document> {
    generateID(): Promise<string>;
    generateHospitalRef(teamId: string): Promise<string>;
    dateOfBirthFromString(value: string): Patient.Attributes['dateOfBirth'];
    // TODO: remove once migrate to cohort v2
    countByWorkgroupAndEid(workgroupId: string, eid: string): Promise<number>;
    // TODO: remove once migrate to cohort v2
    countByWorkgroup(workgroupId: string): Promise<number>;
    updateById(patientId: string, updateData: { [key: string]: any }): Promise<Document>;
    getSearchableEncryptedFields?: () => string[];
  }

  interface View {
    _id: string;
    i: Attributes['i'];
    externalID: Attributes['externalID'];
    externalIDType: Attributes['externalIDType'];
    hospitalRef?: Attributes['hospitalRef'];
    status: Attributes['status'];
    subStatus?: Attributes['subStatus'];
    name: Attributes['name'];
    surname: Attributes['surname'];
    chineseName: Attributes['chineseName'];
    chineseSurname: Attributes['chineseSurname'];
    dateOfBirth?: string;
    email: Attributes['email'];
    phoneNumber: Attributes['phoneNumber'];
    addresses: Attributes['addresses'];
    familyId?: string;
    owner: string | User;
    team?: string | Team;
    consentForms?: ConsentFormView[];
    samples?: PatientSample.View[];
    sequencingLibrary?: PatientSampleSequencingLibrary.View[];
    images: Attributes['images'];
    reports: Attributes['reports'];
    associatedDiseasesWithTieredVariants: Attributes['associatedDiseasesWithTieredVariants'];
    diseaseGene: Attributes['diseaseGene'];
    labPortalID?: Attributes['labPortalID'];
    phenotypes?: PatientPhenotype.View[];
    nextsOfKin: Attributes['nextsOfKin'];
    analysisEligibleTypes: Attributes['analysisEligibleTypes'];
    createdAt: string;
    updatedAt: string;
    analysisEligibleTypesOthers?: Attributes['analysisEligibleTypesOthers'];
    updatedBy: string | User;
    referringUsers?: Attributes['referringUsers'];
    lastExportAt?: string;
  }

  type ConsentFormData = {
    file: Express.Multer.File;
    consentType: string;
    additionalFindings: boolean;
    futureResearch: boolean;
    signedAt: Date;
    minorSignedAt?: Date;
    version: string;
  };

  type ConsentForm = {
    fileName: string;
    consentType: ConsentFormData['consentType'];
    additionalFindings: ConsentFormData['additionalFindings'];
    futureResearch: ConsentFormData['futureResearch'];
    signedAt: ConsentFormData['signedAt'];
    minorSignedAt?: ConsentFormData['minorSignedAt'];
    version: ConsentFormData['version'];
    bucket: string;
    key: string;
    createdAt: Date;
    patientFile: string;
  };

  type ConsentFormView = {
    url: string;
    fileName: ConsentForm['fileName'];
    consentType: ConsentForm['consentType'];
    additionalFindings: ConsentForm['additionalFindings'];
    futureResearch: ConsentForm['futureResearch'];
    signedAt: string;
    minorSignedAt?: string;
    version: ConsentForm['version'];
    createdAt: string;
  };

  type PatientStatus = import('enums').PatientStatus;
  type PatientSubStatus = import('enums').PatientSubStatus;

  type Address = {
    address1: string;
    address2: string;
    area: string;
    cityAndCountry: string;
  };

  type ListRequestFilters = {
    additionalFindings?: boolean;
    futureResearch?: boolean;
    startDate?: string;
    endDate?: string;
    ignoreReferringUser?: boolean;
  };

  type PedigreeData = {
    id: string; // The patientFamilyMembers `patient`
    patient?: Patient.View; // The patients `_id` - could be undefined since FE can add not existing patient
    phenotypes: PatientPhenotype.Attributes[]; // This is the list of patient phenotypes
    relatives?: RelativePedigreeData[];
    patientFamilyMemberData?: PatientFamilyMemberData.Attributes;
    name: string;
    sex?: string;
    display_name?: string;
  };
  type RelationshipType = import('enums').PatientPedigreeRelationship;

  type RelativePedigreeData = {
    is: RelationshipType;
    of: PedigreeData;
  };

  type PatientPedigreeFormat = import('enums').PatientPedigreeFormat;

  type PedigreeDataJson = PedigreeDataEditable & {
    id: string;
  };

  type PedigreeDataEditable = Record<string, any> & {
    name: string;
    display_name: string;
    sex: string;
    mother: string;
    father: string;
    affected?: number;
  };

  type PedigreeTsvDefinition = {
    header: string;
    data: PedigreeDataTsv[];
  };

  type PedigreeDataTsv = {
    familyId: string;
    individualId: string | number;
    paternalId?: string | number;
    maternalId?: string | number;
    sex: number | string;
    phenotype: number;
  };

  type PedigreeRelationship = {
    patient: Patient.Attributes['i'];
    is: unknown;
    of: Patient.Attributes['i'];
  };

  type NextOfKin = {
    name: string;
    email: string;
    phoneNumber: string;
    addresses: Address[];
    relationship: string;
  };

  type ReferringUser = {
    type: string;
    name: string;
  };
}
