declare namespace CorePatient {
  type PredefinedFilterId = number
  type UserDefinedFilterId = string
  type FilterId = PredefinedFilterId | UserDefinedFilterId

  class TierData {
    tier1: number
    tier2: number
    tier3: number
  }

  class TierDataDiseases extends TierData {
    gene: string
    phenotype: string
  }

  class PatientMarker {
    _id?: string
    cn: string
    location: string
  }

  class WorkgroupPatientCreateInput {
    workgroupName: string
    patientId: string
    description: string
  }

  class TierDiseasesDistribution extends TierData {
    _id: TierPhenotypeGene
    gene: string
  }

  class TierPhenotypeGene {
    phenotype: string
    marker: string
  }
  type TierType = 'TIER1' | 'TIER2' | 'TIER3'

  class SearchPatientMarkerInput {
    pageNumber?: number
    pageSize?: number
    filters?: Array<SearchPatientMarkerFilter>
    sort?: {
      by: string
      order: number
    }
  }

  class SearchPatientMarkerFilter {
    columnHeader: string
    value?: string | number
    values?: Array<string | number>
    contains?: Array<string | number>
    low?: string | number
    high?: string | number
  }

  interface PatientWorkgroupField {
    filterId: FilterId
    instance: Array<string>
    array: Array<string>
    userAdded: boolean
  }
}
