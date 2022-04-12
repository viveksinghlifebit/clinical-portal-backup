declare namespace CorePatient {
  class PatientMarker {
    _id?: string;
    cn: string;
    location: string;
  }

  class WorkgroupPatientCreateInput {
    workgroupName: string;
    patientId: string;
    description: string;
  }

  class SearchPatientMarkerInput {
    pageNumber?: number;
    pageSize?: number;
    filters?: Array<SearchPatientMarkerFilter>;
    sort?: {
      by: string;
      order: number;
    };
  }

  class SearchPatientMarkerFilter {
    columnHeader: string;
    value?: string | number;
    values?: Array<string | number>;
    contains?: Array<string | number>;
    low?: string | number;
    high?: string | number;
  }

  interface PatientWorkgroupField {
    label: string;
    filterId: Filter.FilterId;
    instance: Array<string>;
    array: Array<string>;
    userAdded?: boolean;
  }
}
