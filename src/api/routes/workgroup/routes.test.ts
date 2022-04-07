import { TeamRepository } from '@core/repos'
import { loadEndpoints } from 'api/validation'
import supertestRequest from 'supertest'
import config from 'config'
import createApp from 'createApp'
import mongoose from 'mongoose'
import { TeamBuilder } from 'testUtils'
import { workgroupRoutes } from './routes'
import { HttpStatusCodes } from 'enums'
describe('Workgroup', () => {
  let server: Http.Server
  const team = new TeamBuilder().withName('Team').withId(new mongoose.Types.ObjectId().toHexString()).build()

  beforeAll(async () => {
    const app = createApp()
    await loadEndpoints(app, workgroupRoutes, config.apiPrefix)
    server = app.listen()
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await server.close()
  })

  describe('POST /', () => {
    beforeEach(() => {
      jest.spyOn(TeamRepository, 'findById').mockResolvedValue(team)
    })
    afterEach(() => {
      jest.restoreAllMocks()
    })

    test('should create workgroup', async () => {
      console.log(`${config.apiPrefix}/individual-browser/workgroup`)
      const { status, body } = await supertestRequest(server)
        .post(`${config.apiPrefix}/individual-browser/workgroup`)
        .query({
          teamId: team._id
        })
        .send({
          name: 'decouple-test'
        })
      expect(body).toEqual({
        __v: 0,
        _id: expect.any(String),
        createdAt: expect.any(String),
        name: 'decouple-test',
        numberOfPatients: 0,
        owner: expect.any(String),
        team: expect.any(String),
        updatedAt: expect.any(String)
      })
      expect(status).toBe(HttpStatusCodes.OK)
    })
  })
})
