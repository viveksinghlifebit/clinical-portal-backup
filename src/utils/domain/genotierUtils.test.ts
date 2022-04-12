import { GenoTierUtils } from './genotierUtils';
import { TierTypes } from 'enums';
import { GenoMarkerBuilder, GenoTierBuilder, PhenotypeValueBuilder } from 'testUtils';
import { TierDiseasesDistributionBuilder } from 'testUtils/tierDiseasesDistributionBuilder';

describe('GenoTier Utils: suite', () => {
  describe('GenoTier Utils: Testing findGenoDefinition()', () => {
    const genoMarkers = [
      new GenoMarkerBuilder().withFullLocation('10:21213').build(),
      new GenoMarkerBuilder().withFullLocation('10:21214').build(),
      new GenoMarkerBuilder().withFullLocation('8:12234').build(),
      new GenoMarkerBuilder().withFullLocation('8:12235').build()
    ];
    const genoTier = new GenoTierBuilder().withChromosome('10').withFullLocation('10:21213').build();
    const genoTierNotExists = new GenoTierBuilder().withChromosome('11').withFullLocation('11:21213').build();

    test('when genoMarker exists', (done) => {
      expect(GenoTierUtils.findGenoDefinition(genoTier, genoMarkers)?.fullLocation).toStrictEqual('10:21213');
      done();
    });
    test('when genoMarker not exists in the list', (done) => {
      expect(GenoTierUtils.findGenoDefinition(genoTierNotExists, genoMarkers)).toBeUndefined();
      done();
    });
  });

  describe('GenoTier Utils: Testing getTierDistribution()', () => {
    const genoTiersOnlyTier3 = [
      new GenoTierBuilder().withTier(TierTypes.TIER3).withChromosome('6').withFullLocation('6:48709160').build(),
      new GenoTierBuilder().withTier(TierTypes.TIER3).withChromosome('7').withFullLocation('7:70951641').build(),
      new GenoTierBuilder().withTier(TierTypes.TIER3).withChromosome('2').withFullLocation('2: 19243496').build(),
      new GenoTierBuilder().withTier(TierTypes.TIER3).withChromosome('15').withFullLocation('15:75582241').build(),
      new GenoTierBuilder().withTier(TierTypes.TIER3).withChromosome('1').withFullLocation('1:2393556').build()
    ];

    const genoTiers212 = [
      new GenoTierBuilder().withTier(TierTypes.TIER1).withChromosome('6').withFullLocation('6:48709160').build(),
      new GenoTierBuilder().withTier(TierTypes.TIER1).withChromosome('7').withFullLocation('7:70951641').build(),
      new GenoTierBuilder().withTier(TierTypes.TIER2).withChromosome('2').withFullLocation('2:19243496').build(),
      new GenoTierBuilder().withTier(TierTypes.TIER3).withChromosome('15').withFullLocation('15:75582241').build(),
      new GenoTierBuilder().withTier(TierTypes.TIER3).withChromosome('1').withFullLocation('1:2393556').build()
    ];

    test('when only tier3 data exists', (done) => {
      const results = GenoTierUtils.getTierDistribution(genoTiersOnlyTier3);
      expect(results.tier1).toStrictEqual(0);
      expect(results.tier2).toStrictEqual(0);
      expect(results.tier3).toStrictEqual(5);
      done();
    });

    test('when mixed case', (done) => {
      const results = GenoTierUtils.getTierDistribution(genoTiers212);
      expect(results.tier1).toStrictEqual(2);
      expect(results.tier2).toStrictEqual(1);
      expect(results.tier3).toStrictEqual(2);
      done();
    });
  });

  describe('GenoTier Utils: Testing getDiseasesWithVariants()', () => {
    const genoTiers = [
      new GenoTierBuilder()
        .withTier(TierTypes.TIER3)
        .withChromosome('6')
        .withFullLocation('6:48709160')
        .withPhenotype('Ultra-rare undescribed monogenic disorders')
        .withGene('DHX38')
        .build(),
      new GenoTierBuilder()
        .withTier(TierTypes.TIER3)
        .withChromosome('7')
        .withFullLocation('7:70951641')
        .withPhenotype('Ultra-rare undescribed monogenic disorders')
        .withGene('DHX39')
        .build(),
      new GenoTierBuilder()
        .withTier(TierTypes.TIER3)
        .withChromosome('2')
        .withFullLocation('2:19243496')
        .withPhenotype('Genodermatoses with malignancies')
        .withGene('SNP31')
        .build(),
      new GenoTierBuilder()
        .withTier(TierTypes.TIER3)
        .withChromosome('2')
        .withFullLocation('2:2393556')
        .withPhenotype('Congenital Anomaly of the Kidneys and Urinary Tract (CAKUT)')
        .withGene('SNP32')
        .build(),
      new GenoTierBuilder()
        .withTier(TierTypes.TIER3)
        .withChromosome('15')
        .withFullLocation('15:75582241')
        .withPhenotype('Early onset or familial intestinal pseudo obstruction')
        .withGene('SNP33')
        .build(),
      new GenoTierBuilder()
        .withTier(TierTypes.TIER3)
        .withChromosome('15')
        .withFullLocation('15:75582241')
        .withPhenotype('Test empty')
        .withGene()
        .build()
    ];

    test('when diseases exists', (done) => {
      const diseaseGene = GenoTierUtils.getDiseasesWithVariants(genoTiers);
      expect(Object.keys(diseaseGene)[0]).toStrictEqual('Ultra-rare undescribed monogenic disorders');
      expect(Object.values(diseaseGene)[0]).toStrictEqual('DHX38;DHX39');
      expect(Object.keys(diseaseGene)[1]).toStrictEqual('Genodermatoses with malignancies');
      expect(Object.values(diseaseGene)[1]).toStrictEqual('SNP31');
      expect(Object.keys(diseaseGene)[2]).toStrictEqual('Congenital Anomaly of the Kidneys and Urinary Tract (CAKUT)');
      expect(Object.values(diseaseGene)[2]).toStrictEqual('SNP32');
      expect(Object.keys(diseaseGene)[3]).toStrictEqual('Early onset or familial intestinal pseudo obstruction');
      expect(Object.values(diseaseGene)[3]).toStrictEqual('SNP33');
      expect(Object.keys(diseaseGene)[4]).toStrictEqual('Test empty');
      expect(Object.values(diseaseGene)[4]).toStrictEqual('');
      done();
    });
  });

  describe('GenoTier Utils: Testing getIGVFiles()', () => {
    const valuesWithS3 = [
      new PhenotypeValueBuilder().withValue('s3://bucket/file.gz').build(),
      new PhenotypeValueBuilder().withValue('s3://bucket/file-marker.gz').build()
    ];
    const valuesWithHttp = [
      new PhenotypeValueBuilder().withValue('http://bucket.s3-eu-west-1.amazonaws.com/file.gz').build(),
      new PhenotypeValueBuilder().withValue('http://bucket.s3-eu-west-1.amazonaws.com/file-marker.gz').build()
    ];

    test('when igv files start with s3', (done) => {
      const files = GenoTierUtils.getIGVFiles(valuesWithS3);
      expect(files).toHaveLength(2);
      expect(files[0]).toStrictEqual('http://bucket.s3-eu-west-1.amazonaws.com/file.gz');
      expect(files[1]).toStrictEqual('http://bucket.s3-eu-west-1.amazonaws.com/file-marker.gz');
      done();
    });

    test('when igv files start with http', (done) => {
      const files = GenoTierUtils.getIGVFiles(valuesWithHttp);
      expect(files).toHaveLength(2);
      expect(files[0]).toStrictEqual('http://bucket.s3-eu-west-1.amazonaws.com/file.gz');
      expect(files[1]).toStrictEqual('http://bucket.s3-eu-west-1.amazonaws.com/file-marker.gz');
      done();
    });

    test('when no igv files exist', (done) => {
      const files = GenoTierUtils.getIGVFiles([]);
      expect(files).toHaveLength(0);
      done();
    });
  });

  describe('GenoTier Utils: Testing getAssociatedDiseasesWithTieredVariants()', () => {
    const tierDiseasesDistributions = [
      new TierDiseasesDistributionBuilder()
        .withTier1(2)
        .withTier2(1)
        .withTier3(0)
        .withId({ phenotype: 'phenotype1', marker: '7:70951641' })
        .build(),
      new TierDiseasesDistributionBuilder()
        .withTier1(0)
        .withTier2(2)
        .withTier3(1)
        .withId({ phenotype: 'phenotype2', marker: '8:80151211' })
        .build(),
      new TierDiseasesDistributionBuilder()
        .withTier1(0)
        .withTier2(0)
        .withTier3(2)
        .withId({ phenotype: 'phenotype3', marker: '1:1234111' })
        .build(),
      new TierDiseasesDistributionBuilder()
        .withTier1(3)
        .withTier2(3)
        .withTier3(3)
        .withId({ phenotype: 'phenotype4', marker: '1:00007' })
        .build()
    ];
    const genomarkers = [
      new GenoMarkerBuilder().withGene('SNP12').withFullLocation('7:70951641').build(),
      new GenoMarkerBuilder().withGene('SNP13').withFullLocation('8:80151211').build(),
      new GenoMarkerBuilder().withGene('SNP14').withFullLocation('1:1234111').build()
    ];

    test('when values exists', (done) => {
      const results = GenoTierUtils.getAssociatedDiseasesWithTieredVariants(tierDiseasesDistributions, genomarkers);
      expect(results).toHaveLength(4);
      expect(results[0]?.tier1).toStrictEqual(2);
      expect(results[0]?.tier2).toStrictEqual(1);
      expect(results[0]?.tier3).toStrictEqual(0);
      expect(results[0]?.gene).toStrictEqual('SNP12');
      expect(results[0]?.phenotype).toStrictEqual('phenotype1');

      expect(results[1]?.tier1).toStrictEqual(0);
      expect(results[1]?.tier2).toStrictEqual(2);
      expect(results[1]?.tier3).toStrictEqual(1);
      expect(results[1]?.gene).toStrictEqual('SNP13');
      expect(results[1]?.phenotype).toStrictEqual('phenotype2');

      expect(results[2]?.tier1).toStrictEqual(0);
      expect(results[2]?.tier2).toStrictEqual(0);
      expect(results[2]?.tier3).toStrictEqual(2);
      expect(results[2]?.gene).toStrictEqual('SNP14');
      expect(results[2]?.phenotype).toStrictEqual('phenotype3');

      expect(results[3]?.tier1).toStrictEqual(3);
      expect(results[3]?.tier2).toStrictEqual(3);
      expect(results[3]?.tier3).toStrictEqual(3);
      expect(results[3]?.gene).toStrictEqual('1:00007');
      expect(results[3]?.phenotype).toStrictEqual('phenotype4');
      done();
    });
  });
});
