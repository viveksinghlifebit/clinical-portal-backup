import mongoose from 'mongoose';
import supertestRequest from 'supertest';
import config from 'config';
import createApp from 'createApp';
import { PatientBuilder, PatientWorkgroupBuilder, TeamBuilder, UserBuilder, WorkgroupBuilder } from 'testUtils';
import { loadEndpoints } from 'api/validation';
import { comparisonRoutes } from './routes';
import { TeamRepository } from '@core/repos';
import { IndividualComparisonService, WorkgroupService } from '@core/modules';
import { PatientExternalType, PatientStatus, PhenotypeFieldTypes, PhenotypeFieldValueTypes } from '@core/enums';

const filter = {
  _id: '5f99fffef45cdb830814f3ee',
  bucket500: false,
  bucket300: false,
  bucket1000: false,
  bucket2500: false,
  bucket5000: false,
  bucket10000: false,
  categoryPathLevel1: 'Rare disease',
  categoryPathLevel2: 'Participant disease',
  id: 210,
  instances: 1,
  name: 'Normalised disease sub group',
  type: PhenotypeFieldTypes.Bars,
  Sorting: '',
  valueType: PhenotypeFieldValueTypes.Continuous,
  units: '',
  coding: '',
  description: 'Narrower classification of disease',
  descriptionParticipantsNo: '39913',
  link: 'https://cnfl.extge.co.uk/pages/viewpage.action?pageId=147659370',
  array: 5,
  descriptionStability: '',
  descriptionCategoryID: '',
  descriptionItemType: '',
  descriptionStrata: 'Main 100k Programme',
  descriptionSexed: '',
  orderPhenotype: '',
  instance0Name: '',
  instance1Name: '',
  instance2Name: '',
  instance3Name: '',
  instance4Name: '',
  instance5Name: '',
  instance6Name: '',
  instance7Name: '',
  instance8Name: '',
  instance9Name: '',
  instance10Name: '',
  instance11Name: '',
  instance12Name: '',
  instance13Name: '',
  instance14Name: '',
  instance15Name: '',
  instance16Name: ''
};
describe('Comparison', () => {
  let server: Http.Server;
  const user = new UserBuilder().withName('User').withId('2').build();
  const team = new TeamBuilder().withName('Team').withId(new mongoose.Types.ObjectId().toHexString()).build();
  const workgroup = new WorkgroupBuilder()
    .withId('id')
    .withName('Test Name')
    .withTeam(String(team._id))
    .withOwner(String(user._id))
    .withNumberOfPatients(1)
    .build();
  const patient = new PatientBuilder()
    .withId(new mongoose.Types.ObjectId())
    .withI('P0000001')
    .withExternalID('externalId')
    .withExternalIDType(PatientExternalType.Passport)
    .withStatus(PatientStatus.Drafted)
    .withName('aName')
    .withSurname('aSurname')
    .build();
  const patientWorkgroup = new PatientWorkgroupBuilder()
    .withId(new mongoose.Types.ObjectId().toHexString())
    .withWorkgroup(workgroup)
    .withPatient(patient)
    .build();
  beforeAll(async () => {
    const app = createApp();
    await loadEndpoints(app, comparisonRoutes, config.apiPrefix);
    server = app.listen();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await server.close();
  });

  beforeEach(() => {
    jest.spyOn(TeamRepository, 'findById').mockResolvedValue(team);

    jest.spyOn(TeamRepository, 'findById').mockImplementation(() => {
      return Promise.resolve(team);
    });

    jest.spyOn(IndividualComparisonService, 'getComparisonByFieldAndVariant').mockImplementation(() => {
      return Promise.resolve({
        total: 2,
        fieldId: filter,
        notExistingValues: {
          Ciliopathies: 0,
          'Dermatological disorders': 0
        },
        existingValues: {}
      });
    });
    //   })
    jest.spyOn(IndividualComparisonService, 'getParticipantsByVariant').mockImplementation(() => {
      return Promise.resolve(['2285271', '1179844']);
    });

    const spyComparisonFilterToPatient: jest.SpyInstance = jest.spyOn(WorkgroupService, 'addComparisonFilterToPatient');
    spyComparisonFilterToPatient.mockImplementation(() => {
      return Promise.resolve(patientWorkgroup);
    });
    // })
    jest.spyOn(IndividualComparisonService, 'getParticipantsByGene').mockImplementation(() => {
      return Promise.resolve(['2285271', '1179844']);
    });
    jest.spyOn(IndividualComparisonService, 'getComparisonByFieldAndGene').mockImplementation(() => {
      return Promise.resolve({
        total: 2,
        fieldId: filter,
        notExistingValues: {
          Ciliopathies: 0,
          'Dermatological disorders': 0
        },
        existingValues: {}
      });
    });

    jest.spyOn(IndividualComparisonService, 'getComparisonGraphDataByVariant').mockImplementation(() => {
      return Promise.resolve({
        genotypes: {
          heterozygous: 8,
          homozygous: 1
        },
        acmgVerdicts: {
          'Likely Benign': 2,
          Pathogenic: 2,
          'Likely Pathogenic': 2,
          Benign: 1,
          'Uncertain Significance': 1
        }
      });
    });
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe('GET /individual-browser/comparison/field/:id/variant/:variant: get variant comparison', () => {
    test('When team exists, should return valid spec response', async () => {
      const response = await supertestRequest(server)
        .get(`${config.apiPrefix}/individual-browser/comparison/field/1/variant/aVariant`)
        .query({ teamId: team._id });
      expect(response.status).toBe(200);
    });
  });

  describe('GET /individual-browser/comparison/variant/:variant/participants: get variant participants for comparison', () => {
    test('When team exists, should return valid spec response', async () => {
      const response = await supertestRequest(server)
        .get(`${config.apiPrefix}/individual-browser/comparison/variant/aVariant/participants`)
        .query({ teamId: team._id });
      expect(response.status).toBe(200);
    });
  });

  describe('POST /individual-browser/comparison/workgroup/:id/patients/:pId/field: add comparison field', () => {
    test('When team exists, should return valid spec response', async () => {
      const response = await supertestRequest(server)
        .post(`${config.apiPrefix}/individual-browser/comparison/workgroup/workgroupId/patients/patientId/field`)
        .send({ fieldId: '1' })
        .send({ fieldId: '1' })
        .query({ teamId: team._id });
      expect(response.status).toBe(200);
    });

    test('When fieldId doesnt exist, should return error', async () => {
      const response = await supertestRequest(server)
        .post(`${config.apiPrefix}/individual-browser/comparison/workgroup/workgroupId/patients/patientId/field`)
        .query({ teamId: team._id });
      expect(response.status).toBe(400);
    });
  });

  describe('GET /individual-browser/comparison/gene/:gene/participants: get gene participants for comparison', () => {
    test('When data exists, should return valid spec response', async () => {
      const response = await supertestRequest(server)
        .get(`${config.apiPrefix}/individual-browser/comparison/gene/aGene/participants`)
        .query({ teamId: team._id });
      expect(response.status).toBe(200);
    });
  });

  describe('GET /individual-browser/comparison/field/:id/gene/:gene: get gene comparison', () => {
    test('When team exists, should return valid spec response', async () => {
      const response = await supertestRequest(server)
        .get(`${config.apiPrefix}/individual-browser/comparison/field/1/gene/aGene`)
        .query({ teamId: team._id });
      expect(response.status).toBe(200);
    });
  });

  describe('GET /individual-browser/comparison/variant/:variant/graph: get variant graph comparison', () => {
    test('When team exists, should return valid spec response', async () => {
      const response = await supertestRequest(server)
        .get(`${config.apiPrefix}/individual-browser/comparison/variant/aVariant/graph`)
        .query({ teamId: team._id });
      expect(response.status).toBe(200);
    });
  });
});
