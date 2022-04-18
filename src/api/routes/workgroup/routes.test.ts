import { TeamRepository } from '@core/repos';
import { loadEndpoints } from 'api/validation';
import supertestRequest from 'supertest';
import config from 'config';
import createApp from 'createApp';
import mongoose from 'mongoose';
import { createPatientWorkgroupInDB, TeamBuilder, UserBuilder } from 'testUtils';
import { workgroupRoutes } from './routes';
import { HttpStatusCodes } from 'enums';
import { PatientWorkgroup, SequenceId, Workgroup } from '@core/models';
import { basicPatient as getBasicPatient, createPatientInDB } from 'testUtils/patientBuilder';
import * as connection from 'services/mongoose/connections';

describe('Workgroup', () => {
  let server: Http.Server;
  const team = new TeamBuilder().withName('Team').withId(new mongoose.Types.ObjectId().toHexString()).build();
  const user: User = new UserBuilder().withId(new mongoose.Types.ObjectId().toHexString()).withName('user').build();

  beforeAll(async () => {
    const app = createApp();
    await loadEndpoints(app, workgroupRoutes, config.apiPrefix);
    server = app.listen();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await server.close();
  });
  beforeEach(() => {
    jest.spyOn(TeamRepository, 'findById').mockResolvedValue(team);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /individual-browser/workgroup', () => {
    test('should create workgroup', async () => {
      const { status, body } = await supertestRequest(server)
        .post(`${config.apiPrefix}/individual-browser/workgroup`)
        .query({
          teamId: team._id
        })
        .send({
          name: 'decouple-test'
        });
      expect(body).toEqual({
        __v: 0,
        _id: expect.any(String),
        createdAt: expect.any(String),
        name: 'decouple-test',
        numberOfPatients: 0,
        owner: expect.any(String),
        team: expect.any(String),
        updatedAt: expect.any(String)
      });
      expect(status).toBe(HttpStatusCodes.OK);
    });
  });

  describe('DELETE /individual-browser/workgroup/:id', () => {
    test('should delete the workgroup', async () => {
      const createdWorkgroup = await Workgroup.create({
        name: 'test',
        numberOfPatients: 2,
        team: team._id,
        owner: user._id
      });

      const { status, body } = await supertestRequest(server)
        .delete(`${config.apiPrefix}/individual-browser/workgroup/${String(createdWorkgroup._id)}`)
        .query({
          teamId: team._id
        });
      const dbResult = await Workgroup.findById(createdWorkgroup._id);
      expect(dbResult).toBeNull();
      expect(body).toEqual({});
      expect(status).toBe(HttpStatusCodes.OK);
    });
  });

  describe('POST /individual-browser/workgroup/search', () => {
    test('should search the workgroup', async () => {
      const workgroupToSearch = await Workgroup.create({
        name: 'test',
        numberOfPatients: 2,
        team: team._id,
        owner: user._id
      });

      await Workgroup.create({
        name: 'should-not-come',
        numberOfPatients: 2,
        team: team._id,
        owner: user._id
      });

      const { status, body } = await supertestRequest(server)
        .post(`${config.apiPrefix}/individual-browser/workgroup/search?pageNumber=0&pageSize=10`)
        .query({
          teamId: team._id
        })
        .send({ criteria: [{ columnHeader: 'name', value: 'test' }] });
      expect(body).toEqual({
        page: 0,
        pages: 1,
        total: 1,
        workgroups: [
          {
            ...workgroupToSearch.view(),
            owner: null
          }
        ]
      });
      expect(status).toBe(HttpStatusCodes.OK);
    });
  });

  describe('POST /individual-browser/workgroup/patient', () => {
    test('should create the patient inside the workgroup', async () => {
      await Workgroup.create({
        name: 'test',
        numberOfPatients: 2,
        team: team._id,
        owner: user._id
      });

      const sequence = { _id: new mongoose.Types.ObjectId(), name: 'patient', value: 1, prefix: 'P' };

      await SequenceId.create(sequence);
      const patient = getBasicPatient(String(user._id));

      const createdPatient = await createPatientInDB(patient, String(user._id), String(team._id));

      const { status, body } = await supertestRequest(server)
        .post(`${config.apiPrefix}/individual-browser/workgroup/patient`)
        .query({
          teamId: team._id
        })
        .send({ workgroupName: 'test', patientId: String(createdPatient._id), description: 'description' });
      expect(body).toHaveProperty('_id');
      expect(status).toBe(HttpStatusCodes.OK);
    });
  });

  describe('GET /individual-browser/workgroup/suggestions', () => {
    test('should find workgroup by name', async () => {
      const createdWorkgroup = await Workgroup.create({
        name: 'test-check',
        numberOfPatients: 2,
        team: team._id,
        owner: new mongoose.Types.ObjectId(user._id)
      });

      const userInput = {
        _id: new mongoose.Types.ObjectId(user._id)
      };
      await connection.usersConnection.collection('users').insertOne(userInput);

      const { status, body } = await supertestRequest(server)
        .get(`${config.apiPrefix}/individual-browser/workgroup/suggestions`)
        .query({
          teamId: team._id,
          term: 'test'
        });
      expect(body).toStrictEqual([
        {
          _id: createdWorkgroup._id.toHexString(),
          name: 'test-check',
          numberOfPatients: 2,
          owner: {
            _id: user._id
          },
          team: team._id
        }
      ]);
      expect(status).toBe(HttpStatusCodes.OK);

      await connection.usersConnection.collection('users').deleteOne({ _id: new mongoose.Types.ObjectId(user._id) });
    });
  });

  describe('DELETE /individual-browser/workgroup/:id/patient/:pId', () => {
    test('should delete patientworkgroup by workgroupId and patientId', async () => {
      const createdWorkgroup = await Workgroup.create({
        name: 'test-check',
        numberOfPatients: 2,
        team: team._id,
        owner: new mongoose.Types.ObjectId(user._id)
      });

      const patient = getBasicPatient(String(user._id));

      const createdPatient = await createPatientInDB(patient, String(user._id), String(team._id));
      const patientWorkgroup = await createPatientWorkgroupInDB({
        workgroup: createdWorkgroup._id,
        patient: createdPatient._id,
        fields: []
      });

      const userInput = {
        _id: new mongoose.Types.ObjectId(user._id)
      };
      await connection.usersConnection.collection('users').insertOne(userInput);

      const { status, body } = await supertestRequest(server)
        .delete(
          `${config.apiPrefix}/individual-browser/workgroup/${createdWorkgroup._id}/patient/${patientWorkgroup._id}`
        )
        .query({
          teamId: team._id
        });

      expect(body).toStrictEqual({
        _id: createdWorkgroup._id.toHexString(),
        name: 'test-check',
        numberOfPatients: 0,
        owner: {
          _id: user._id
        },
        team: team._id
      });
      expect(status).toBe(HttpStatusCodes.OK);

      const expectedWorkgroup = await PatientWorkgroup.findById(patientWorkgroup._id);
      expect(expectedWorkgroup).toBeNull();

      await connection.usersConnection.collection('users').deleteOne({ _id: new mongoose.Types.ObjectId(user._id) });
    });
  });

  describe('GET /individual-browser/workgroup/:id/patient/:pId', () => {
    test('should get patientworkgroup by workgroupId and patientId', async () => {
      const createdWorkgroup = await Workgroup.create({
        name: 'test-check',
        numberOfPatients: 2,
        team: team._id,
        owner: new mongoose.Types.ObjectId(user._id)
      });

      const patient = getBasicPatient(String(user._id));

      const createdPatient = await createPatientInDB(patient, String(user._id), String(team._id));
      const patientWorkgroup = await createPatientWorkgroupInDB({
        workgroup: createdWorkgroup._id,
        patient: createdPatient._id,
        fields: []
      });

      const userInput = {
        _id: new mongoose.Types.ObjectId(user._id)
      };
      await connection.usersConnection.collection('users').insertOne(userInput);

      const { status, body } = await supertestRequest(server)
        .get(`${config.apiPrefix}/individual-browser/workgroup/${createdWorkgroup._id}/patient/${patientWorkgroup._id}`)
        .query({
          teamId: team._id
        });

      expect(body).toStrictEqual({
        _id: String(patientWorkgroup._id),
        associatedDiseasesWithTieredVariants: [],
        comparisonFilters: [],
        createdAt: expect.any(String),
        description: 'default',
        fields: [
          {
            label: 'Date of Birth:',
            readOnly: true,
            value: '-'
          },
          {
            label: 'Email:',
            readOnly: true,
            value: '-'
          },
          {
            label: 'Phone Number:',
            readOnly: true,
            value: '-'
          },
          {
            filterId: 1000,
            instance: ['0'],
            instanceNames: [],
            label: 'HPO terms:',
            readOnly: true,
            value: '-'
          },
          {
            array: ['0'],
            filterId: 4,
            instance: ['0'],
            instanceNames: [],
            label: 'Sex:',
            readOnly: true,
            value: '-'
          },
          {
            array: ['0'],
            filterId: 1,
            instance: ['0'],
            instanceNames: [],
            label: 'Ethnicity:',
            readOnly: true,
            value: '-'
          }
        ],
        igvFiles: [],
        markers: [],
        markersDefinition: [],
        patient: {
          _id: patient._id.toHexString(),
          addresses: [],
          analysisEligibleTypes: [],
          associatedDiseasesWithTieredVariants: [],
          createdAt: expect.any(String),
          externalID: 'externalId',
          externalIDType: 'Passport',
          i: 'P0000002',
          images: [],
          labPortalID: 'MockedId',
          name: 'name',
          nextsOfKin: [],
          owner: String(user._id),
          referringUsers: [],
          reports: [],
          samples: [],
          sequencingLibrary: [],
          status: 'Enrolled',
          surname: 'surname',
          team: String(team._id),
          updatedAt: expect.any(String),
          updatedBy: String(user._id)
        },
        tierSNV: {
          tier1: 0,
          tier2: 0,
          tier3: 0
        },
        updatedAt: expect.any(String),
        workgroup: {
          __v: 0,
          _id: String(createdWorkgroup._id),
          createdAt: expect.any(String),
          name: 'test-check',
          numberOfPatients: 2,
          owner: String(user._id),
          team: String(team._id),
          updatedAt: expect.any(String)
        }
      });
      expect(status).toBe(HttpStatusCodes.OK);

      await connection.usersConnection.collection('users').deleteOne({ _id: new mongoose.Types.ObjectId(user._id) });
    });
  });

  describe('POST /individual-browser/workgroup/:id/patient/:pId/save-marker', () => {
    test('should save workgroup patient markers', async () => {
      const createdWorkgroup = await Workgroup.create({
        name: 'test-check',
        numberOfPatients: 2,
        team: team._id,
        owner: new mongoose.Types.ObjectId(user._id)
      });

      const patient = getBasicPatient(String(user._id));

      const createdPatient = await createPatientInDB(patient, String(user._id), String(team._id));
      const patientWorkgroup = await createPatientWorkgroupInDB({
        workgroup: createdWorkgroup._id,
        patient: createdPatient._id,
        fields: []
      });

      const userInput = {
        _id: new mongoose.Types.ObjectId(user._id)
      };
      await connection.usersConnection.collection('users').insertOne(userInput);

      const { status, body } = await supertestRequest(server)
        .post(
          `${config.apiPrefix}/individual-browser/workgroup/${createdWorkgroup._id}/patient/${patientWorkgroup._id}/save-marker`
        )
        .query({
          teamId: team._id
        })
        .send({
          markers: ['test']
        });

      expect(body.markers).toStrictEqual([
        {
          _id: expect.any(String),
          cn: 'test',
          location: ''
        }
      ]);
      expect(status).toBe(HttpStatusCodes.OK);

      await connection.usersConnection.collection('users').deleteOne({ _id: new mongoose.Types.ObjectId(user._id) });
    });
  });

  describe('GET /individual-browser/workgroup/:id/patients', () => {
    test('should get workgroup patients', async () => {
      const createdWorkgroup = await Workgroup.create({
        name: 'test-check',
        numberOfPatients: 2,
        team: team._id,
        owner: new mongoose.Types.ObjectId(user._id)
      });

      const patient = getBasicPatient(String(user._id));

      const createdPatient = await createPatientInDB(patient, String(user._id), String(team._id));
      await createPatientWorkgroupInDB({
        workgroup: createdWorkgroup._id,
        patient: createdPatient._id,
        fields: []
      });

      const userInput = {
        _id: new mongoose.Types.ObjectId(user._id)
      };
      await connection.usersConnection.collection('users').insertOne(userInput);

      const { status, body } = await supertestRequest(server)
        .get(`${config.apiPrefix}/individual-browser/workgroup/${createdWorkgroup._id}/patients`)
        .query({
          teamId: team._id
        });

      expect(body.length).toStrictEqual(1);
      expect(status).toBe(HttpStatusCodes.OK);

      await connection.usersConnection.collection('users').deleteOne({ _id: new mongoose.Types.ObjectId(user._id) });
    });
  });

  describe('POST /individual-browser/workgroup/:id/patient/:pId/field', () => {
    test('should save workgroup patient fields', async () => {
      const createdWorkgroup = await Workgroup.create({
        name: 'test-check',
        numberOfPatients: 2,
        team: team._id,
        owner: new mongoose.Types.ObjectId(user._id)
      });

      const patient = getBasicPatient(String(user._id));

      const createdPatient = await createPatientInDB(patient, String(user._id), String(team._id));
      const createdPatientWorkgroup = await createPatientWorkgroupInDB({
        workgroup: createdWorkgroup._id,
        patient: createdPatient._id,
        fields: []
      });

      const userInput = {
        _id: new mongoose.Types.ObjectId(user._id)
      };
      await connection.usersConnection.collection('users').insertOne(userInput);
      const phenotypeFields = {
        _id: new mongoose.Types.ObjectId(),
        id: 991
      };
      await connection.clinicalPortalConnection.collection('phenotypefields').insertOne(phenotypeFields);

      const { status } = await supertestRequest(server)
        .post(
          `${config.apiPrefix}/individual-browser/workgroup/${createdWorkgroup._id}/patient/${createdPatientWorkgroup._id}/field`
        )
        .query({
          teamId: team._id
        })
        .send({
          filterId: 991,
          instance: ['instance'],
          array: ['array']
        });

      expect(status).toBe(HttpStatusCodes.OK);

      const expectedPatientWorkgroup = await PatientWorkgroup.findById(createdPatientWorkgroup._id);
      expect(expectedPatientWorkgroup?.fields.length).toStrictEqual(1);

      await connection.clinicalPortalConnection.collection('phenotypefields').deleteOne({ _id: phenotypeFields._id });
      await connection.usersConnection.collection('users').deleteOne({ _id: new mongoose.Types.ObjectId(user._id) });
    });
  });

  describe('DELETE /individual-browser/workgroup/:id/patient/:pId/field/:fieldId', () => {
    test('should delete workgroup patient field', async () => {
      const createdWorkgroup = await Workgroup.create({
        name: 'test-check',
        numberOfPatients: 2,
        team: team._id,
        owner: new mongoose.Types.ObjectId(user._id)
      });

      const patient = getBasicPatient(String(user._id));

      const createdPatient = await createPatientInDB(patient, String(user._id), String(team._id));
      const createdPatientWorkgroup = await createPatientWorkgroupInDB({
        workgroup: createdWorkgroup._id,
        patient: createdPatient._id,
        fields: [
          {
            userAdded: true,
            filterId: 199,
            array: ['0'],
            instance: ['instance']
          },
          {
            filterId: 1,
            array: ['0'],
            instance: ['instance']
          }
        ]
      });

      const userInput = {
        _id: new mongoose.Types.ObjectId(user._id)
      };
      await connection.usersConnection.collection('users').insertOne(userInput);
      const phenotypeFields = {
        _id: new mongoose.Types.ObjectId(),
        id: 199
      };
      await connection.clinicalPortalConnection.collection('phenotypefields').insertOne(phenotypeFields);

      const { status } = await supertestRequest(server)
        .delete(
          `${config.apiPrefix}/individual-browser/workgroup/${createdWorkgroup._id}/patient/${createdPatientWorkgroup._id}/field/199`
        )
        .query({
          teamId: team._id
        });

      expect(status).toBe(HttpStatusCodes.OK);
      const expectedPatientWorkgroup = await PatientWorkgroup.findById(createdPatientWorkgroup._id);
      expect(expectedPatientWorkgroup?.fields.length).toStrictEqual(1);

      await connection.clinicalPortalConnection.collection('phenotypefields').deleteOne({ _id: phenotypeFields._id });
      await connection.usersConnection.collection('users').deleteOne({ _id: new mongoose.Types.ObjectId(user._id) });
    });
  });

  describe('POST /individual-browser/workgroup/patient/validate', () => {
    test('should validate patient in workgroup', async () => {
      await Workgroup.create({
        name: 'test-check',
        numberOfPatients: 2,
        team: team._id,
        owner: new mongoose.Types.ObjectId(user._id)
      });

      const patient = getBasicPatient(String(user._id));

      const createdPatient = await createPatientInDB(patient, String(user._id), String(team._id));
      const userInput = {
        _id: new mongoose.Types.ObjectId(user._id)
      };
      await connection.usersConnection.collection('users').insertOne(userInput);

      const { status, body } = await supertestRequest(server)
        .post(`${config.apiPrefix}/individual-browser/workgroup/patient/validate`)
        .query({
          teamId: team._id
        })
        .send({
          workgroupName: 'test-check',
          patientId: createdPatient._id.toHexString()
        });

      expect(status).toBe(HttpStatusCodes.OK);
      expect(body).toStrictEqual({ isValid: true });
      await connection.usersConnection.collection('users').deleteOne({ _id: new mongoose.Types.ObjectId(user._id) });
    });
  });
});
