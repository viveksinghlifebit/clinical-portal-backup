import { TeamRepository } from '@core/repos';
import { loadEndpoints } from 'api/validation';
import supertestRequest from 'supertest';
import config from 'config';
import createApp from 'createApp';
import mongoose from 'mongoose';
import { TeamBuilder, UserBuilder } from 'testUtils';
import { workgroupRoutes } from './routes';
import { HttpStatusCodes } from 'enums';
import { Patient, SequenceId, Workgroup } from '@core/models';
import { PatientBuilder } from 'testUtils/patientBuilder';
import { PatientStatus } from '@core/enums';
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
      const patient = new PatientBuilder()
        .withI('P01')
        .withId(new mongoose.Types.ObjectId())
        .withName('name')
        .withSurname('surname')
        .withLabPortalId('MockedId')
        .withOwner(new mongoose.Types.ObjectId(user._id))
        .build();

      const createdPatient = await Patient.create({
        ...patient,
        team: team._id,
        status: PatientStatus.Enrolled,
        updatedBy: new mongoose.Types.ObjectId(user._id),
        externalIDType: 'Passport',
        externalID: 'externalId'
      });

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
});
