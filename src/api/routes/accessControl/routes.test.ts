import mongoose from 'mongoose'
import supertestRequest from 'supertest'
import { TeamBuilder } from 'testUtils'
import { loadEndpoints } from 'api/validation'
import config from 'config'
import { RoleService, UserRoleService } from 'core/modules'
import { TeamRepository } from 'core/repos'
import createApp from 'createApp'
import { HttpStatusCodes } from 'enums'
import { accessControlRoutes } from './routes'

describe('Access control', () => {
  let server: Http.Server
  const team = new TeamBuilder().withName('Team').withId(new mongoose.Types.ObjectId().toHexString()).build()

  beforeAll(async () => {
    const app = createApp()
    await loadEndpoints(app, accessControlRoutes, config.apiPrefix)
    server = app.listen()
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await server.close()
  })

  describe('GET /access-control/user-roles', () => {
    beforeEach(() => {
      jest.spyOn(TeamRepository, 'findById').mockResolvedValue(team)
    })
    afterEach(() => {
      jest.restoreAllMocks()
    })
    test('should give BadRequest if fetching user-roles without teamId', async () => {
      const { status, body } = await supertestRequest(server).get(`${config.apiPrefix}/access-control/user-roles`)
      expect(status).toBe(HttpStatusCodes.BadRequest)
      expect(body.code).toEqual('BadRequest')
      expect(body.statusCode).toEqual(400)
      expect(body.message).toEqual(
        `validation failed for operation getUserRoles with error` +
          ` [{"keyword":"required","dataPath":".query","schemaPath":"#/properties/query/required",` +
          `"params":{"missingProperty":"teamId"},"message":"should have required property 'teamId'"}]`
      )
    })

    test('should give internalServerError if fetching user-roles results in error', async () => {
      jest.spyOn(UserRoleService, 'listUserRolesPaginated').mockImplementation(() => Promise.reject('error'))
      const { status, body } = await supertestRequest(server)
        .get(`${config.apiPrefix}/access-control/user-roles`)
        .query({ teamId: team._id })
      expect(status).toBe(HttpStatusCodes.InternalServerError)
      expect(body.code).toEqual('InternalServerError')
      expect(body.statusCode).toEqual(500)
      expect(body.message).toEqual('Internal server error.')
    })

    test('should fetch user-roles results', async () => {
      const expectedResult = {
        pageNumber: 1,
        pageSize: 1,
        totalCount: 1,
        totalPages: 1,
        data: [
          {
            id: '61250a5662c96e045d8b61c6',
            name: 'vivek',
            surname: 'singh',
            teamName: 'T - CBDemoTeam',
            roles: [
              {
                name: 'Bioinformatician',
                displayName: 'Bioinformatician'
              }
            ]
          }
        ]
      }
      jest.spyOn(UserRoleService, 'listUserRolesPaginated').mockImplementation(() => Promise.resolve(expectedResult))
      const { status, body } = await supertestRequest(server)
        .get(`${config.apiPrefix}/access-control/user-roles`)
        .query({ teamId: team._id })
      expect(status).toBe(HttpStatusCodes.OK)
      expect(body).toMatchObject(expectedResult)
    })
  })

  describe('PUT /access-control/user-roles', () => {
    beforeEach(() => {
      jest.spyOn(TeamRepository, 'findById').mockResolvedValue(team)
    })
    afterEach(() => {
      jest.restoreAllMocks()
    })
    test('should give BadRequest if updating user-role without teamId', async () => {
      const { status, body } = await supertestRequest(server).put(`${config.apiPrefix}/access-control/user-roles`)
      expect(status).toBe(HttpStatusCodes.BadRequest)
      expect(body.code).toEqual('BadRequest')
      expect(body.statusCode).toEqual(400)
    })

    test('should give BadRequest if updating user-role without requestBody', async () => {
      const { status, body } = await supertestRequest(server)
        .put(`${config.apiPrefix}/access-control/user-roles`)
        .query({ teamId: team._id })

      expect(status).toBe(HttpStatusCodes.BadRequest)
      expect(body.code).toEqual('BadRequest')
      expect(body.statusCode).toEqual(400)
    })

    test('should give BadRequest if updating user-role with email field with a normal text', async () => {
      const { status, body } = await supertestRequest(server)
        .put(`${config.apiPrefix}/access-control/user-roles`)
        .query({ teamId: team._id })
        .send({ email: 'test' })

      expect(status).toBe(HttpStatusCodes.BadRequest)
      expect(body.code).toEqual('BadRequest')
      expect(body.statusCode).toEqual(400)
    })

    test('should give NoContent if updating user-role with email field which is not present in database', async () => {
      jest.spyOn(UserRoleService, 'updateUserRole').mockResolvedValue((null as unknown) as UserRole.RolesPopulatedView)
      const { status } = await supertestRequest(server)
        .put(`${config.apiPrefix}/access-control/user-roles`)
        .query({ teamId: team._id })
        .send({
          email: 'test@test.com',
          roles: ['Bioinformatician']
        })
      expect(status).toBe(HttpStatusCodes.NoContent)
    })

    test('should give NoContent if updating user-role which is not present in database', async () => {
      jest.spyOn(UserRoleService, 'updateUserRole').mockResolvedValue((null as unknown) as UserRole.RolesPopulatedView)
      const { status } = await supertestRequest(server)
        .put(`${config.apiPrefix}/access-control/user-roles`)
        .query({ teamId: team._id })
        .send({
          userId: new mongoose.Types.ObjectId().toHexString(),
          roles: ['Bioinformatician']
        })
      expect(status).toBe(HttpStatusCodes.NoContent)
    })

    test('should give internalServerError if updating user-roles results in error', async () => {
      jest.spyOn(UserRoleService, 'updateUserRole').mockImplementation(() => Promise.reject('error'))
      const { status, body } = await supertestRequest(server)
        .put(`${config.apiPrefix}/access-control/user-roles`)
        .query({ teamId: team._id })
        .send({
          userId: new mongoose.Types.ObjectId().toHexString(),
          roles: ['Bioinformatician']
        })
      expect(status).toBe(HttpStatusCodes.InternalServerError)
      expect(body.code).toEqual('InternalServerError')
      expect(body.statusCode).toEqual(500)
      expect(body.message).toEqual(`Internal server error.`)
    })

    test('should update user-roles results', async () => {
      const expectedResult = {
        id: new mongoose.Types.ObjectId().toHexString(),
        name: 'vivek',
        surname: 'singh',
        teamName: 'T - CBDemoTeam',
        roles: [
          {
            name: 'Bioinformatician',
            displayName: 'Bioinformatician'
          }
        ]
      }
      jest.spyOn(UserRoleService, 'updateUserRole').mockImplementation(() => Promise.resolve(expectedResult))
      const { status, body } = await supertestRequest(server)
        .put(`${config.apiPrefix}/access-control/user-roles`)
        .send({
          userId: new mongoose.Types.ObjectId().toHexString(),
          roles: ['Bioinformatician']
        })
        .query({ teamId: team._id })
      expect(status).toBe(HttpStatusCodes.OK)
      expect(body).toMatchObject(expectedResult)
    })
  })

  describe('POST /access-control/user-roles', () => {
    beforeEach(() => {
      jest.spyOn(TeamRepository, 'findById').mockResolvedValue(team)
    })
    afterEach(() => {
      jest.restoreAllMocks()
    })
    test('should give BadRequest if creating user-role without teamId', async () => {
      const { status, body } = await supertestRequest(server).post(`${config.apiPrefix}/access-control/user-roles`)
      expect(status).toBe(HttpStatusCodes.BadRequest)
      expect(body.code).toEqual('BadRequest')
      expect(body.statusCode).toEqual(400)
    })

    test('should give BadRequest if creating user-role without requestBody', async () => {
      const { status, body } = await supertestRequest(server)
        .post(`${config.apiPrefix}/access-control/user-roles`)
        .query({ teamId: team._id })

      expect(status).toBe(HttpStatusCodes.BadRequest)
      expect(body.code).toEqual('BadRequest')
      expect(body.statusCode).toEqual(400)
    })

    test('should give internalServerError if creating user-roles results in error', async () => {
      jest.spyOn(UserRoleService, 'createUserRole').mockImplementation(() => Promise.reject('error'))
      const { status, body } = await supertestRequest(server)
        .post(`${config.apiPrefix}/access-control/user-roles`)
        .query({ teamId: team._id })
        .send({
          userId: new mongoose.Types.ObjectId().toHexString(),
          roles: ['Bioinformatician']
        })
      expect(status).toBe(HttpStatusCodes.InternalServerError)
      expect(body.code).toEqual('InternalServerError')
      expect(body.statusCode).toEqual(500)
      expect(body.message).toEqual(`Internal server error.`)
    })

    test('should give NoContent if creating user-role for user which is not present in database', async () => {
      jest.spyOn(UserRoleService, 'createUserRole').mockImplementation(() => Promise.resolve(null))
      const { status } = await supertestRequest(server)
        .post(`${config.apiPrefix}/access-control/user-roles`)
        .send({
          userId: new mongoose.Types.ObjectId().toHexString(),
          roles: ['Bioinformatician']
        })
        .query({ teamId: team._id })
      expect(status).toBe(HttpStatusCodes.NoContent)
    })

    test('should create user-roles results', async () => {
      const expectedResult = {
        id: new mongoose.Types.ObjectId().toHexString(),
        name: 'vivek',
        surname: 'singh',
        teamName: 'T - CBDemoTeam',
        roles: [
          {
            name: 'Bioinformatician',
            displayName: 'Bioinformatician'
          }
        ]
      }
      jest.spyOn(UserRoleService, 'createUserRole').mockImplementation(() => Promise.resolve(expectedResult))
      const { status, body } = await supertestRequest(server)
        .post(`${config.apiPrefix}/access-control/user-roles`)
        .send({
          userId: new mongoose.Types.ObjectId().toHexString(),
          roles: ['Bioinformatician']
        })
        .query({ teamId: team._id })
      expect(status).toBe(HttpStatusCodes.OK)
      expect(body).toMatchObject(expectedResult)
    })
  })

  describe('DELETE /access-control/user-roles', () => {
    beforeEach(() => {
      jest.spyOn(TeamRepository, 'findById').mockResolvedValue(team)
    })
    afterEach(() => {
      jest.restoreAllMocks()
    })
    test('should give BadRequest if deleting user-role without teamId', async () => {
      const { status, body } = await supertestRequest(server).delete(`${config.apiPrefix}/access-control/user-roles`)
      expect(status).toBe(HttpStatusCodes.BadRequest)
      expect(body.code).toEqual('BadRequest')
      expect(body.statusCode).toEqual(400)
    })

    test('should give BadRequest if deleting user-role without requestBody', async () => {
      const { status, body } = await supertestRequest(server)
        .delete(`${config.apiPrefix}/access-control/user-roles`)
        .query({ teamId: team._id })

      expect(status).toBe(HttpStatusCodes.BadRequest)
      expect(body.code).toEqual('BadRequest')
      expect(body.statusCode).toEqual(400)
    })

    test('should give internalServerError if deleting user-roles results in error', async () => {
      jest.spyOn(UserRoleService, 'deleteUserRole').mockImplementation(() => Promise.reject('error'))
      const { status, body } = await supertestRequest(server)
        .delete(`${config.apiPrefix}/access-control/user-roles`)
        .query({ teamId: team._id })
        .send({
          userId: new mongoose.Types.ObjectId().toHexString(),
          roles: ['Bioinformatician']
        })
      expect(status).toBe(HttpStatusCodes.InternalServerError)
      expect(body.code).toEqual('InternalServerError')
      expect(body.statusCode).toEqual(500)
      expect(body.message).toEqual(`Internal server error.`)
    })

    test('should delete user-roles results', async () => {
      jest.spyOn(UserRoleService, 'deleteUserRole').mockImplementation(() => Promise.resolve())
      const { status, body } = await supertestRequest(server)
        .delete(`${config.apiPrefix}/access-control/user-roles`)
        .send({
          userId: new mongoose.Types.ObjectId().toHexString(),
          roles: ['Bioinformatician']
        })
        .query({ teamId: team._id })
      expect(status).toBe(HttpStatusCodes.OK)
      expect(body).toMatchObject({})
    })
  })
  describe('GET /access-control/roles/me', () => {
    beforeEach(() => {
      jest.spyOn(TeamRepository, 'findById').mockResolvedValue(team)
    })
    afterEach(() => {
      jest.restoreAllMocks()
    })
    test('should give BadRequest if fetching my user roles does not have teamId query param', async () => {
      jest.spyOn(UserRoleService, 'getMyUserRole').mockImplementation(() => Promise.reject('error'))
      const { status, body } = await supertestRequest(server).get(`${config.apiPrefix}/access-control/roles/me`)
      expect(status).toBe(HttpStatusCodes.BadRequest)
      expect(body.code).toEqual('BadRequest')
      expect(body.statusCode).toEqual(400)
    })
    test('should give internalServerError if fetching my user roles gives error', async () => {
      jest.spyOn(UserRoleService, 'getMyUserRole').mockImplementation(() => Promise.reject('error'))
      const { status, body } = await supertestRequest(server)
        .get(`${config.apiPrefix}/access-control/roles/me`)
        .query({ teamId: team._id })
      expect(status).toBe(HttpStatusCodes.InternalServerError)
      expect(body.code).toEqual('InternalServerError')
      expect(body.statusCode).toEqual(500)
      expect(body.message).toEqual('Internal server error.')
    })

    test('should give empty body if user-role is not present in database', async () => {
      jest.spyOn(UserRoleService, 'getMyUserRole').mockImplementation(() => Promise.resolve({} as UserRole.View))
      const { status, body } = await supertestRequest(server)
        .get(`${config.apiPrefix}/access-control/roles/me`)
        .query({ teamId: team._id })

      expect(status).toBe(HttpStatusCodes.OK)
      expect(Object.keys(body).length).toBe(0)
    })

    test('should give my user-roles results', async () => {
      const expectedResult = {
        _id: new mongoose.Types.ObjectId().toHexString(),
        roles: [
          {
            name: 'Bioinformatician',
            permissions: [
              {
                name: 'cohortFieldCategories',
                access: {
                  read: true
                }
              }
            ]
          }
        ],
        team: new mongoose.Types.ObjectId().toHexString(),
        userId: new mongoose.Types.ObjectId().toHexString()
      }
      jest.spyOn(UserRoleService, 'getMyUserRole').mockResolvedValue((expectedResult as unknown) as UserRole.View)
      const { status, body } = await supertestRequest(server)
        .get(`${config.apiPrefix}/access-control/roles/me`)
        .query({ teamId: team._id })
      expect(status).toBe(HttpStatusCodes.OK)
      expect(body).toMatchObject(expectedResult)
    })
  })

  describe('POST /access-control/roles/me', () => {
    beforeEach(() => {
      jest.spyOn(TeamRepository, 'findById').mockResolvedValue(team)
    })
    afterEach(() => {
      jest.restoreAllMocks()
    })
    test('should give BadRequest if fetching my user roles does not have teamId query param', async () => {
      jest.spyOn(UserRoleService, 'createBaseUserRole').mockImplementation(() => Promise.reject('error'))
      const { status, body } = await supertestRequest(server).get(`${config.apiPrefix}/access-control/roles/me`)
      expect(status).toBe(HttpStatusCodes.BadRequest)
      expect(body.code).toEqual('BadRequest')
      expect(body.statusCode).toEqual(400)
    })
    test('should give internalServerError if fetching my user roles gives error', async () => {
      jest.spyOn(UserRoleService, 'createBaseUserRole').mockImplementation(() => Promise.reject('error'))
      const { status, body } = await supertestRequest(server)
        .post(`${config.apiPrefix}/access-control/roles/me`)
        .query({ teamId: team._id })
      expect(status).toBe(HttpStatusCodes.InternalServerError)
      expect(body.code).toEqual('InternalServerError')
      expect(body.statusCode).toEqual(500)
      expect(body.message).toEqual('Internal server error.')
    })

    test('should give empty body if user-role is not present in database', async () => {
      jest.spyOn(UserRoleService, 'createBaseUserRole').mockImplementation(() => Promise.resolve({} as UserRole.View))
      const { status, body } = await supertestRequest(server)
        .post(`${config.apiPrefix}/access-control/roles/me`)
        .query({ teamId: team._id })

      expect(status).toBe(HttpStatusCodes.OK)
      expect(Object.keys(body).length).toBe(0)
    })

    test('should give my user-roles results', async () => {
      const expectedResult = {
        _id: new mongoose.Types.ObjectId().toHexString(),
        roles: [
          {
            name: 'Bioinformatician',
            permissions: [
              {
                name: 'cohortFieldCategories',
                access: {
                  read: true
                }
              }
            ]
          }
        ],
        team: new mongoose.Types.ObjectId().toHexString(),
        userId: new mongoose.Types.ObjectId().toHexString()
      }
      jest.spyOn(UserRoleService, 'createBaseUserRole').mockResolvedValue((expectedResult as unknown) as UserRole.View)
      const { status, body } = await supertestRequest(server)
        .post(`${config.apiPrefix}/access-control/roles/me`)
        .query({ teamId: team._id })
      expect(status).toBe(HttpStatusCodes.OK)
      expect(body).toMatchObject(expectedResult)
    })
  })

  describe('Role', () => {
    const dummyRole = {
      name: 'test',
      displayName: 'test',
      permissions: [
        {
          name: 'individualBrowserWorkGroup',
          access: { read: true, create: false, update: false, delete: false }
        }
      ]
    }
    describe('GET /access-control/roles', () => {
      beforeEach(() => {
        jest.spyOn(TeamRepository, 'findById').mockResolvedValue(team)
      })
      afterEach(() => {
        jest.restoreAllMocks()
      })
      test('should give internalServerError if fetching roles results in error', async () => {
        jest.spyOn(RoleService, 'listRolesPaginated').mockImplementation(() => Promise.reject('error'))
        const { status, body } = await supertestRequest(server).get(`${config.apiPrefix}/access-control/roles`)
        expect(status).toBe(HttpStatusCodes.InternalServerError)
        expect(body.code).toEqual('InternalServerError')
        expect(body.statusCode).toEqual(500)
        expect(body.message).toEqual('Internal server error.')
      })

      test('should fetch roles results', async () => {
        const expectedResult = {
          pageNumber: 1,
          pageSize: 1,
          totalCount: 1,
          totalPages: 1,
          data: [dummyRole]
        }
        jest.spyOn(RoleService, 'listRolesPaginated').mockImplementation(() => Promise.resolve(expectedResult))
        const { status, body } = await supertestRequest(server).get(`${config.apiPrefix}/access-control/roles`)
        expect(status).toBe(HttpStatusCodes.OK)
        expect(body).toMatchObject(expectedResult)
      })
    })

    describe('PUT /access-control/roles', () => {
      beforeEach(() => {
        jest.spyOn(TeamRepository, 'findById').mockResolvedValue(team)
      })
      afterEach(() => {
        jest.restoreAllMocks()
      })
      test('should give BadRequest if updating user-role without requestBody', async () => {
        const { status, body } = await supertestRequest(server).put(`${config.apiPrefix}/access-control/roles`)
        expect(status).toBe(HttpStatusCodes.BadRequest)
        expect(body.code).toEqual('BadRequest')
        expect(body.statusCode).toEqual(400)
      })

      test('should give internalServerError if updating roles results in error', async () => {
        jest.spyOn(RoleService, 'updateRole').mockImplementation(() => Promise.reject('error'))
        const { status, body } = await supertestRequest(server)
          .put(`${config.apiPrefix}/access-control/roles`)
          .send(dummyRole)
        expect(status).toBe(HttpStatusCodes.InternalServerError)
        expect(body.code).toEqual('InternalServerError')
        expect(body.statusCode).toEqual(500)
        expect(body.message).toEqual(`Internal server error.`)
      })

      test('should update roles results', async () => {
        jest.spyOn(RoleService, 'updateRole').mockImplementation(() => Promise.resolve(dummyRole))
        const { status, body } = await supertestRequest(server)
          .put(`${config.apiPrefix}/access-control/roles`)
          .send(dummyRole)
        expect(status).toBe(HttpStatusCodes.OK)
        expect(body).toMatchObject(dummyRole)
      })
    })

    describe('POST /access-control/roles', () => {
      beforeEach(() => {
        jest.spyOn(TeamRepository, 'findById').mockResolvedValue(team)
      })
      afterEach(() => {
        jest.restoreAllMocks()
      })
      test('should give BadRequest if creating user-role without requestBody', async () => {
        const { status, body } = await supertestRequest(server).post(`${config.apiPrefix}/access-control/roles`)
        expect(status).toBe(HttpStatusCodes.BadRequest)
        expect(body.code).toEqual('BadRequest')
        expect(body.statusCode).toEqual(400)
      })

      test('should give internalServerError if creating roles results in error', async () => {
        jest.spyOn(RoleService, 'createRole').mockImplementation(() => Promise.reject('error'))
        const { status, body } = await supertestRequest(server)
          .post(`${config.apiPrefix}/access-control/roles`)
          .send(dummyRole)
        expect(status).toBe(HttpStatusCodes.InternalServerError)
        expect(body.code).toEqual('InternalServerError')
        expect(body.statusCode).toEqual(500)
        expect(body.message).toEqual(`Internal server error.`)
      })

      test('should create roles results', async () => {
        jest.spyOn(RoleService, 'createRole').mockImplementation(() => Promise.resolve(dummyRole))
        const { status, body } = await supertestRequest(server)
          .post(`${config.apiPrefix}/access-control/roles`)
          .send(dummyRole)
        expect(status).toBe(HttpStatusCodes.OK)
        expect(body).toMatchObject(dummyRole)
      })
    })

    describe('DELETE /access-control/roles', () => {
      beforeEach(() => {
        jest.spyOn(TeamRepository, 'findById').mockResolvedValue(team)
      })
      afterEach(() => {
        jest.restoreAllMocks()
      })
      test('should give BadRequest if deleting role without name', async () => {
        const { status, body } = await supertestRequest(server).delete(`${config.apiPrefix}/access-control/roles`)
        expect(status).toBe(HttpStatusCodes.BadRequest)
        expect(body.code).toEqual('BadRequest')
        expect(body.statusCode).toEqual(400)
      })

      test('should give internalServerError if deleting user-roles results in error', async () => {
        jest.spyOn(RoleService, 'deleteRole').mockImplementation(() => Promise.reject('error'))
        const { status, body } = await supertestRequest(server)
          .delete(`${config.apiPrefix}/access-control/roles`)
          .send({
            name: 'test'
          })
        expect(status).toBe(HttpStatusCodes.InternalServerError)
        expect(body.code).toEqual('InternalServerError')
        expect(body.statusCode).toEqual(500)
        expect(body.message).toEqual(`Internal server error.`)
      })

      test('should delete user-roles results', async () => {
        jest.spyOn(RoleService, 'deleteRole').mockImplementation(() => Promise.resolve())
        const { status, body } = await supertestRequest(server)
          .delete(`${config.apiPrefix}/access-control/roles`)
          .send({
            name: 'test'
          })
        expect(status).toBe(HttpStatusCodes.OK)
        expect(body).toMatchObject({})
      })
    })

    describe('POST /access-control/invite-role', () => {
      beforeEach(() => {
        jest.spyOn(TeamRepository, 'findById').mockResolvedValue(team)
      })
      afterEach(() => {
        jest.restoreAllMocks()
      })
      type RequestParams = {
        requestBody?: Partial<InvitationUserRole.InviteRequest>[]
        teamId?: string
      }
      const makeRequest = ({ requestBody, teamId }: RequestParams): supertestRequest.Test => {
        return supertestRequest(server)
          .post(`${config.apiPrefix}/access-control/invited-role`)
          .query({ teamId })
          .send(requestBody)
      }

      test.each<[string, RequestParams]>([
        ['teamId query param', {}],
        ['requestBody', { teamId: 'test' }],
        ['any property inside requestBody', { teamId: 'test', requestBody: [] }],
        ['email property inside requestBody', { teamId: 'test', requestBody: [{ roles: ['test'] }] }],
        ['roles property inside requestBody', { teamId: 'test', requestBody: [{ email: 'test@test.com' }] }],
        [
          'any roles inside requestBody.roles',
          { teamId: 'test', requestBody: [{ email: 'test@test.com', roles: [] }] }
        ],
        ['have valid email inside requestBody', { teamId: 'test', requestBody: [{ email: 'test', roles: ['test'] }] }]
      ])('should give BadRequest if request does not have %s', async (_testCase, requestBody) => {
        const { status, body } = await makeRequest(requestBody)
        expect(status).toBe(HttpStatusCodes.BadRequest)
        expect(body.code).toEqual('BadRequest')
        expect(body.statusCode).toEqual(400)
      })

      test('should give Created if valid Request params and body is sent', async () => {
        jest.spyOn(UserRoleService, 'invite').mockImplementation(() => Promise.resolve())
        const { status } = await makeRequest({
          teamId: 'test',
          requestBody: [{ email: 'test@test.com', roles: ['Nurse'] }]
        })
        expect(status).toBe(HttpStatusCodes.Created)
      })

      test('should give InternalServerError if there is any error thrown', async () => {
        jest.spyOn(UserRoleService, 'invite').mockImplementation(() => Promise.reject('error'))
        const { status, body } = await makeRequest({
          teamId: 'test',
          requestBody: [{ email: 'test@test.com', roles: ['Nurse'] }]
        })
        expect(status).toBe(HttpStatusCodes.InternalServerError)
        expect(body.statusCode).toEqual(500)
      })
    })
  })
})
