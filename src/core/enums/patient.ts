export enum SampleAnalysisTypes {
  Solo = 'Solo',
  DuosPatientMother = 'DuosPatientMother',
  DuosPatientFather = 'DuosPatientFather',
  Trio = 'Trio',
  TumorNormalPaired = 'TumorNormalPaired',
  Others = 'Others'
}

export enum PatientStatus {
  Drafted = 'Drafted',
  Enrolled = 'Enrolled',
  Withdraw = 'Withdraw'
}

export enum PatientSubStatus {
  PartiallyWithdrawn = 'PartiallyWithdrawn'
}

export enum PatientPedigreeRelationship {
  // TODO to be completed with more relationships
  Mother = 'Mother',
  Father = 'Father',
  Child = 'Child',
  Partner = 'Partner',
  TwinsMonozygotic = 'TwinsMonozygotic',
  TwinsDizygotic = 'TwinsDizygotic'
}

export enum PatientPedigreeFormat {
  Json = 'json',
  Tsv = 'tsv'
}

export enum PatientReferringUserType {
  ReferringClinician = 'ReferringClinician',
  FieldSpecialist = 'FieldSpecialist'
}
