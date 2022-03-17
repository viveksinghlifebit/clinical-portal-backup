export enum RolesRoutes {
  Cohorts = 'cohorts', // /cohort-browser/v2/cohort(get|post),
  Cohort = 'cohort', // /cohort-browser/v2/cohort/{id}(delete|get|put),
  ParticipantsField = 'participantsField', // /cohort-browser/v2/cohort/fields/{id}/participants (get)
  MetadataFilter = 'metadataFilter', // /cohort-browser/v2/cohort/filter/{id}/metadata (get)
  CohortFields = 'cohortFields', // /cohort-browser/v2/cohort/fields (get)
  CohortFieldSearch = 'cohortFieldSearch', // /cohort-browser/v2/cohort/fields_search (get)
  CohortFieldCategories = 'cohortFieldCategories', // /cohort-browser/v2/cohort/fieldCategories (get)
  CohortFilterData = 'cohortFilterData', // /cohort-browser/v2/cohort/filter/{id}/data (post)
  CohortFilterParticipants = 'cohortFilterParticipants', // /cohort-browser/v2/cohort/{id}/filter/participants (post)
  CohortFilters = 'cohortFilters', // /cohort-browser/v2/filters (get)
  CohortGenomarkers = 'cohortGenomarkers', // /cohort-browser/v2/cohort/genomarkers/{id} (get|delete)
  CohortParticipantsSearch = 'cohortParticipantsSearch', // /cohort-browser/v2/cohort/participants/search (post)
  CohortParticipantsExportApiScript = 'cohortParticipantsExportApiScript', // /cohort-browser/v2/cohort/participants/export/api-script (post)
  CohortParticipantsExport = 'cohortParticipantsExport', // /cohort-browser/v2/cohort/participants/export (post)
  CohortParticipantsS3Upload = 'cohortParticipantsS3Upload', // /cohort-browser/v2/cohort/participants/s3-upload (post)
  CohortParticipantsExportAll = 'cohortParticipantsExportAll', // /cohort-browser/v2/cohort/participants/export/all (post)
  // /cohort-browser/v2/cohort/participants/export/all/api-script (post)
  CohortParticipantsExportAllApiScript = 'cohortParticipantsExportAllApiScript',
  CohortGenotypicSave = 'cohortGenotypicSave', // /cohort-browser/v2/cohort/genotypic-save (post)
  CohortDataExport = 'cohortDataExport', // /cohort-browser/v2/cohort/data/export (post)
  CohortGenoTypicDataExport = 'cohortGenoTypicDataExport', // /cohort-browser/v2/cohort/genotypic-data/export (post)
  CohortFilterPreview = 'cohortFilterPreview', // /cohort-browser/v2/cohort/filter/{id}/preview (get)
  // /cohort-browser/v2/individual-browser/workgroup (post)
  // /cohort-browser/v2/individual-browser/workgroup/{id} (delete | get)
  IndividualBrowserWorkGroup = 'individualBrowserWorkGroup',
  IndividualBrowserWorkGroupSearch = 'individualBrowserWorkGroupSearch', // /cohort-browser/v2/individual-browser/workgroup/search (post)
  // /cohort-browser/v2/individual-browser/workgroup/{id}/patient/{pId} (delete | get)
  // /cohort-browser/v2/individual-browser/workgroup/patient (post)
  IndividualBrowserWorkGroupPatient = 'individualBrowserWorkGroupPatient',
  // /cohort-browser/v2/individual-browser/workgroup/{id}/patients (get)
  IndividualBrowserWorkGroupPatients = 'individualBrowserWorkGroupPatients',
  IndividualBrowserPatients = 'individualBrowserPatients', // /cohort-browser/v2/individual-browser/patients (get|post)
  IndividualBrowserPatient = 'individualBrowserPatient', // /cohort-browser/v2/individual-browser/patients/{id} (get|put|delete)
  // /cohort-browser/v2/individual-browser/patients/{id}/phenotypes (put|delete)
  IndividualBrowserPatientsPhenotypes = 'individualBrowserPatientsPhenotypes',
  // /cohort-browser/v2/individual-browser/patients/{id}/consent-form (post)
  IndividualBrowserPatientsConsentForm = 'individualBrowserPatientsConsentForm',
  // /cohort-browser/v2/individual-browser/patients/files/download (get)
  IndividualBrowserPatientsFileDownload = 'individualBrowserPatientsFileDownload',
  // /cohort-browser/v2/individual-browser/patients/{id}/sample (post)
  // /cohort-browser/v2/individual-browser/patients/{id}/sample/{sid} (put|delete)
  IndividualBrowserPatientsSample = 'IndividualBrowserPatientsSample',
  // /cohort-browser/v2/individual-browser/patients/{id}/visits (get|post)
  IndividualBrowserPatientsVisit = 'IndividualBrowserPatientsVisit',
  // /cohort-browser/v2/individual-browser/patients/{id}/enroll (put)
  IndividualBrowserPatientsEnroll = 'IndividualBrowserPatientsEnroll',
  // /cohort-browser/v2/individual-browser/samples/{id} (patch|delete)
  IndividualBrowserSamples = 'individualBrowserSamples',
  // /cohort-browser/v2/individual-browser/workgroup/{id}/patient/{pId}/save-marker (post)
  IndividualBrowserWorkgroupPatientSaveMarker = 'individualBrowserWorkgroupPatientSaveMarker',
  // /cohort-browser/v2/individual-browser/patients/{id}/markers-tier (post)
  IndividualBrowserPatientMarkersTier = 'individualBrowserPatientMarkersTier',
  // /cohort-browser/v2/individual-browser/comparison/field/{id}/variant/{variant} (get)
  IndividualBrowserComparisonFieldVariant = 'individualBrowserComparisonFieldVariant',
  // /cohort-browser/v2/individual-browser/comparison/variant/{variant}/participants (get)
  IndividualBrowserComparisonVariantParticipants = 'individualBrowserComparisonVariantParticipants',
  // /cohort-browser/v2/individual-browser/comparison/workgroup/{id}/patients/{pId}/field (post)
  IndividualBrowserComparisonWorkGroupPatients = 'individualBrowserComparisonWorkGroupPatients',
  // /cohort-browser/v2/individual-browser/comparison/gene/{gene}/participants (get)
  IndividualBrowserComparisonGeneParticipants = 'individualBrowserComparisonGeneParticipants',
  // /cohort-browser/v2/individual-browser/comparison/field/{id}/gene/{gene} (get)
  IndividualBrowserComparisonFieldGene = 'individualBrowserComparisonFieldGene',
  // /cohort-browser/v2/individual-browser/comparison/workgroup/{id}/patients/{pId}/field/{fieldId} (delete)
  IndividualBrowserComparisonWorkGroupPatientsField = 'individualBrowserComparisonWorkGroupPatientsField',
  // /cohort-browser/v2/individual-browser/workgroup/{id}/patient/{pId}/field (post)
  // /cohort-browser/v2/individual-browser/workgroup/{id}/patient/{pId}/field/{fieldId} (delete)
  IndividualBrowserWorkGroupPatientsField = 'individualBrowserWorkGroupPatientsField',
  // /cohort-browser/v2/individual-browser/patients/{id}/pedigree (get)
  // /cohort-browser/v2/individual-browser/patients/{id}/pedigree/{pId} (put)
  IndividualBrowserPatientsPedigree = 'individualBrowserPatientsPedigree',
  // /cohort-browser/v2/individual-browser/patients/{id}/files (get|post)
  // /cohort-browser/v2/individual-browser/patients/{id}/files/{fileId} (put)
  IndividualBrowserPatientsFile = 'individualBrowserPatientsFile',
  // /cohort-browser/v2/individual-browser/patients/{id}/files/{fileId}/archive-status (put)
  IndividualBrowserPatientsFileArchiveStatus = 'individualBrowserPatientsFileArchiveStatus',
  // /cohort-browser/v2/individual-browser/patients/{id}/pedigree/{pId}/meta (put)
  IndividualBrowserPatientsPedigreeMeta = 'individualBrowserPatientsPedigreeMeta',
  // /cohort-browser/v2/individual-browser/patients/{id}/pedigree/{pId}/export (get)
  IndividualBrowserPatientsPedigreeExport = 'individualBrowserPatientsPedigreeExport',
  // /cohort-browser/v2/individual-browser/patients/{id}/notes (get|post)
  IndividualBrowserPatientsNotes = 'individualBrowserPatientsNotes',
  // /cohort-browser/v2/individual-browser/patients/{id}/notes/{nId} (get|put)
  IndividualBrowserPatientsNote = 'individualBrowserPatientsNote',
  // /cohort-browser/v2/individual-browser/patients/{id}/notes/{nId}/archive-status (put)
  IndividualBrowserPatientsNoteArchiveStatus = 'individualBrowserPatientsNoteArchiveStatus',
  // /cohort-browser/v2/individual-browser/workgroup/patient/validate (post)
  IndividualBrowserWorkGroupPatientValidate = 'individualBrowserWorkGroupPatientValidate',
  // /cohort-browser/v2/cohort/genotypic-headers (get)
  CohortGenotypicHeaders = 'cohortGenotypicHeaders',
  // /cohort-browser/v2/cohort/genotypic-data (post)
  CohortGenoTypicData = 'cohortGenoTypicData',
  // /cohort-browser/v2/individual-browser/comparison/variant/{variant}/graph (get)
  IndividualBrowserComparisonVariantGraph = 'individualBrowserComparisonVariantGraph',
  // /cohort-browser/v2/version (get)
  Version = 'version',
  // /cohort-browser/v2/genomics/studies (get)
  GenomicsStudies = 'genomicsStudies',
  // /cohort-browser/v2/genomics/search-variants (post)
  GenomicsSearchVariants = 'genomicsSearchVariants',
  // /cohort-browser/v2/individual-browser/workgroup/suggestions (get)
  IndividualBrowserWorkGroupSuggestions = 'individualBrowserWorkGroupSuggestions',
  // /cohort-browser/v2/genomics/variants/samples (get)
  GenomicsVariantsSample = 'genomicsVariantsSample',
  // /cohort-browser/v2/individual-browser/pedigrees/{patient} (get|put|delete)
  // /cohort-browser/v2/individual-browser/pedigrees (post)
  IndividualBrowserPedigrees = 'individualBrowserPedigrees',
  // /cohort-browser/v2/individual-browser/pedigrees/{patient}/export (get|put)
  IndividualBrowserPedigreesExport = 'IndividualBrowserPedigreesExport',
  // /cohort-browser/v2/individual-browser/pedigrees/relationship (post|delete)
  IndividualBrowserPedigreesRelationship = 'individualBrowserPedigreesRelationship',
  // /cohort-browser/v2/access-control/user-roles (get|put)
  AccessControlUserRoles = 'accessControlUserRoles',
  // /cohort-browser/v2/access-control/roles (post|get|put|delete)
  AccessControlRoles = 'accessControlRoles',
  IGV = 'IGV',
  PrintLabel = 'printLabel',
  // /cohort-browser/v2/individual-browser/patients/{id}/sample/{sid}/meta (PUT)
  IndividualBrowserPatientsSampleMeta = 'individualBrowserPatientsSampleMeta',
  ArchivePatientFilePermission = 'archivePatientFilePermission',
  Pedigree = 'pedigree',
  PatientManagementSpecimen = 'patientManagementSpecimen',
  ReferringUsers = 'referringUsers',
  PatientWithdrawalInfo = 'PatientWithdrawalInfo',
  PatientWithdrawalApproval = 'PatientWithdrawalApproval',
  PatientWithdrawalRequest = 'PatientWithdrawalRequest',
  ViewWithdrawalPatient = 'viewWithdrawalPatient'
}
