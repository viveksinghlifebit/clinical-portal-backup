import { PatientStatus, SampleAnalysisTypes } from '@core/enums';
import mongoose from 'mongoose';

export const getPatientView = (overrideAddress: Patient.Address[]): Patient.View =>
  (({
    _id: new mongoose.Types.ObjectId().toHexString(),
    addresses: [
      { cityAndCountry: 'Kwun Tong District', address1: 'test', address2: 'test2', area: '17005' },
      ...overrideAddress
    ],
    associatedDiseasesWithTieredVariants: [],
    chineseName: '',
    chineseSurname: '',
    createdAt: '',
    dateOfBirth: new Date('2000-11-15').toISOString(),
    diseaseGene: {},
    email: 'joDoe@example.com',
    externalID: '',
    externalIDType: '',
    familyId: '',
    i: 'P00000001',
    hospitalRef: 'DT000001',
    images: [],
    name: 'Jo',
    owner: new mongoose.Types.ObjectId().toHexString(),
    phoneNumber: '+852 8208 7252',
    reports: [],
    status: PatientStatus.Enrolled,
    surname: 'Doe',
    team: undefined,
    labPortalID: '',
    nextsOfKin: [],
    updatedAt: '',
    analysisEligibleTypes: [SampleAnalysisTypes.Trio],
    updatedBy: new mongoose.Types.ObjectId().toHexString()
  } as unknown) as Patient.View);

export const getPatientWorkgroupAttributes = (): PatientWorkgroup.Attributes =>
  ({
    markers: [
      {
        cn: 'cn',
        location: 'location',
        _id: new mongoose.Types.ObjectId().toHexString()
      }
    ],
    comparisonFilters: [1],
    workgroup: 'workgroup',
    description: 'description',
    markersDefinition: [
      {
        cn: 'cn',
        fullLocation: 'fulllocation',
        gene: 'gene',
        id: 1,
        index: 1,
        _id: new mongoose.Types.ObjectId()
      }
    ],
    igvFiles: ['igvFiles'],
    associatedDiseasesWithTieredVariants: [
      {
        gene: 'gene',
        phenotype: 'phenotype',
        tier1: 1,
        tier2: 2,
        tier3: 3
      }
    ],
    createdAt: new Date(),
    diseaseGene: {
      test: 'Test'
    },
    fields: [],
    patient: new mongoose.Types.ObjectId().toHexString(),
    tierSNV: {
      tier1: 1,
      tier2: 2,
      tier3: 3
    },
    updatedAt: new Date()
  } as PatientWorkgroup.Attributes);
