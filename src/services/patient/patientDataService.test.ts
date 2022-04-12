import { PatientDataService } from './patientDataService';
import { GenoMarkerRepository, GenoTiersRepository, PhenotypeFieldRepository } from '@core/repos';
import { getPatientWorkgroupAttributes } from './mocks/patient.mocks';
import mongoose from 'mongoose';

describe('PatientDataService', () => {
  describe('createPatientData', () => {
    beforeEach(() => {
      jest.spyOn(GenoTiersRepository, 'findGenotierData').mockResolvedValue([
        {
          _id: new mongoose.Types.ObjectId(),
          chromosome: 'chromose',
          fullLocation: 'fulllocation',
          gene: 'gene',
          i: 'i',
          location: 'location',
          phenotype: 'phenotype',
          position: 'position',
          tier: 'TIER1'
        }
      ]);
      jest.spyOn(PhenotypeFieldRepository, 'findByCriteria').mockResolvedValue([
        {
          _id: new mongoose.Types.ObjectId(),
          a: 'a',
          f: 'f',
          i: 'i',
          is: 'is',
          v: 'v'
        }
      ]);

      jest.spyOn(GenoTiersRepository, 'findAggregatedTierDataForPatient').mockResolvedValue([
        {
          _id: {
            marker: 'marker',
            phenotype: 'phenotype'
          },
          tier3: 3,
          gene: 'gene',
          tier2: 2,
          tier1: 1
        }
      ]);

      jest.spyOn(GenoMarkerRepository, 'findByFullLocations').mockResolvedValue([
        {
          cn: 'cn',
          fullLocation: 'fullLocation',
          gene: 'gene',
          id: 1,
          index: 1,
          _id: new mongoose.Types.ObjectId()
        }
      ]);
    });

    afterAll(jest.restoreAllMocks);
    test('should populate tierSNV, dieseaseGene, igvFiles and associatedDiseaseWithTieredVariants', async () => {
      const patient = getPatientWorkgroupAttributes();
      const {
        tierSNV: originalTierSNV,
        diseaseGene: originalDiseaseGene,
        igvFiles: originalIgvFiles,
        associatedDiseasesWithTieredVariants: originalAssociatedDiseasesWithTieredVariants
      } = patient;
      await PatientDataService.createPatientData(patient, '1');
      expect(patient.tierSNV).not.toBe(originalTierSNV);
      expect(patient.tierSNV).toStrictEqual({
        tier1: 1,
        tier2: 0,
        tier3: 0
      });

      expect(patient.diseaseGene).not.toBe(originalDiseaseGene);
      expect(patient.diseaseGene).toStrictEqual({ phenotype: 'gene' });

      expect(patient.igvFiles).not.toBe(originalIgvFiles);
      expect(patient.igvFiles).toStrictEqual(['v']);

      expect(patient.associatedDiseasesWithTieredVariants).not.toBe(originalAssociatedDiseasesWithTieredVariants);
      expect(patient.associatedDiseasesWithTieredVariants).toStrictEqual([
        {
          gene: 'marker',
          phenotype: 'phenotype',
          tier1: 1,
          tier2: 2,
          tier3: 3
        }
      ]);
    });
  });
});
