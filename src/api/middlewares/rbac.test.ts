import { RolesRoutes } from 'enums'
import { UserRole, Role } from '@core/models'
import { rbacMiddleware, rbac } from './rbac'
import mongoose from 'mongoose'
import { ForbiddenHttpError, UnauthorizedHttpError } from 'errors/http-errors'

const data = {
  userRole: {
    basic: () =>
      new UserRole({
        _id: '6140d0eebf5a981449ec7d51',
        userId: '6140d0eebf5a981449ec7d52',
        team: '6140d0eebf5a981449ec7d53',
        roles: ['6140d0eebf5a981449ec7d54', '6140d0eebf5a981449ec7d55']
      }).view()
  },
  roles: {
    cohortAllowReadAccess: () => [
      new Role({
        displayName: 'role-display-name',
        name: 'role-name',
        permissions: [
          {
            access: {
              read: true,
              create: false,
              update: false,
              delete: false
            },
            _id: '6140d0eebf5a981449ec7d54',
            name: 'cohort'
          },
          {
            access: {
              read: true,
              create: false,
              update: false,
              delete: false
            },
            _id: '6140d0eebf5a981449ec7d55',
            name: 'cohort'
          }
        ]
      }).view()
    ],
    cohortNoAccess: () => [
      new Role({
        displayName: 'role-display-name',
        name: 'role-name',
        permissions: [
          {
            access: {
              read: false,
              create: false,
              update: false,
              delete: false
            },
            _id: '6140d0eebf5a981449ec7d54',
            name: 'cohort'
          }
        ]
      }).view()
    ],
    cohortConflictingAccess: () => [
      new Role({
        displayName: 'role-display-name',
        name: 'role-name',
        permissions: [
          {
            access: {
              read: true,
              create: false,
              update: false,
              delete: false
            },
            _id: '6140d0eebf5a981449ec7d54',
            name: 'cohort'
          },
          {
            access: {
              read: false,
              create: false,
              update: false,
              delete: false
            },
            _id: '6140d0eebf5a981449ec7d55',
            name: 'cohort'
          }
        ]
      }).view()
    ]
  }
}

const req = {
  basic: () =>
    (({
      request: {
        method: 'get'
      },
      query: {
        teamId: new mongoose.Types.ObjectId().toHexString()
      },
      user: {
        _id: 'user-1'
      }
    } as unknown) as Koa.Context),
  noUserId: () =>
    (({
      request: {
        method: 'get'
      },
      query: {
        teamId: new mongoose.Types.ObjectId().toHexString()
      },
      user: {}
    } as unknown) as Koa.Context),
  noUser: () =>
    (({
      request: {
        method: 'get'
      },
      query: {
        teamId: new mongoose.Types.ObjectId().toHexString()
      }
    } as unknown) as Koa.Context),
  notSupportedMethod: () =>
    (({
      request: {
        method: 'connect'
      },
      query: {
        teamId: new mongoose.Types.ObjectId().toHexString()
      },
      user: {
        _id: 'user-1'
      }
    } as unknown) as Koa.Context)
}

const applyRbac = async (mockContext: Koa.Context, mockNext: jest.Mock, featureFlag = true): Promise<void> => {
  await rbacMiddleware(RolesRoutes.Cohort, featureFlag)(mockContext, mockNext)
}

afterEach(() => {
  jest.restoreAllMocks()
})

describe('RBAC middleware', () => {
  test('should call next with error status 403 when the user does not have the appropriate permission', async () => {
    const mockNext = jest.fn()
    const mockReq = req.basic()
    jest.spyOn(UserRole, 'findByUserAndTeamId').mockImplementation(() => Promise.resolve(data.userRole.basic()))
    jest.spyOn(Role, 'findRolesByRoleIds').mockImplementation(() => Promise.resolve(data.roles.cohortNoAccess()))

    await expect(applyRbac(mockReq, mockNext)).rejects.toThrowError(
      new ForbiddenHttpError(`You don’t have the right permissions. Please contact your admin`)
    )
  })

  test('should call next with error status 403 when an error occured when fetching UserRoles', async () => {
    const mockNext = jest.fn()
    const mockReq = req.basic()
    jest.spyOn(UserRole, 'findByUserAndTeamId').mockImplementation(() => Promise.reject('something bad happen'))
    jest
      .spyOn(Role, 'findRolesByRoleIds')
      .mockImplementation(() => Promise.resolve(data.roles.cohortConflictingAccess()))

    await expect(applyRbac(mockReq, mockNext)).rejects.toThrowError(
      new ForbiddenHttpError(`Could not find your RBAC role`)
    )
  })

  test('should call next with error status 403 when an error occured when fetching Roles', async () => {
    const mockNext = jest.fn()
    const mockReq = req.basic()
    jest.spyOn(UserRole, 'findByUserAndTeamId').mockImplementation(() => Promise.resolve(data.userRole.basic()))
    jest.spyOn(Role, 'findRolesByRoleIds').mockImplementation(() => Promise.reject('something went wrong'))

    await expect(applyRbac(mockReq, mockNext)).rejects.toThrowError(
      new ForbiddenHttpError(`Could not find your RBAC role`)
    )
  })

  test('should call next with error status 403 when the requested action does not exist in the rbac actions', async () => {
    const mockNext = jest.fn()
    jest.spyOn(UserRole, 'findByUserAndTeamId').mockImplementation(() => Promise.resolve(data.userRole.basic()))
    jest
      .spyOn(Role, 'findRolesByRoleIds')
      .mockImplementation(() => Promise.resolve(data.roles.cohortConflictingAccess()))
    const mockReq = req.notSupportedMethod()

    await expect(applyRbac(mockReq, mockNext)).rejects.toThrowError(
      new ForbiddenHttpError(`Could not identify the RBAC action`)
    )
  })

  test('should call next with error status 403 when the userRole is undefined', async () => {
    const mockNext = jest.fn()
    const mockReq = req.notSupportedMethod()
    jest.spyOn(UserRole, 'findByUserAndTeamId').mockImplementation(() => Promise.resolve(undefined))
    jest.spyOn(Role, 'findRolesByRoleIds').mockImplementation(() => Promise.resolve(data.roles.cohortAllowReadAccess()))

    await expect(applyRbac(mockReq, mockNext)).rejects.toThrowError(
      new ForbiddenHttpError(`Could not identify the RBAC action`)
    )
  })

  test('should call next with error status 403 when the roles are an empty array', async () => {
    const mockNext = jest.fn()
    jest.spyOn(UserRole, 'findByUserAndTeamId').mockImplementation(() => Promise.resolve(data.userRole.basic()))
    jest.spyOn(Role, 'findRolesByRoleIds').mockImplementation(() => Promise.resolve([]))
    const mockReq = req.notSupportedMethod()

    await expect(applyRbac(mockReq, mockNext)).rejects.toThrowError(
      new ForbiddenHttpError(`Could not identify the RBAC action`)
    )
  })

  test('Should call next with error status 401 when the user object doe not exist in the req', async () => {
    const mockNext = jest.fn()
    const mockReq = req.noUser()
    jest.spyOn(UserRole, 'findByUserAndTeamId').mockImplementation(() => Promise.resolve(data.userRole.basic()))
    jest
      .spyOn(Role, 'findRolesByRoleIds')
      .mockImplementation(() => Promise.resolve(data.roles.cohortConflictingAccess()))

    await expect(applyRbac(mockReq, mockNext)).rejects.toThrowError(new UnauthorizedHttpError())
  })

  test('Should call next with error status 401 when the user object does not contain an _id', async () => {
    const mockNext = jest.fn()
    const mockReq = req.noUserId()
    jest.spyOn(UserRole, 'findByUserAndTeamId').mockImplementation(() => Promise.resolve(data.userRole.basic()))
    jest
      .spyOn(Role, 'findRolesByRoleIds')
      .mockImplementation(() => Promise.resolve(data.roles.cohortConflictingAccess()))

    await expect(applyRbac(mockReq, mockNext)).rejects.toThrowError(new UnauthorizedHttpError())
  })

  test('Should call next with with no err when the user has the appropriate permission', async () => {
    const mockNext = jest.fn()
    const mockReq = req.basic()
    jest.spyOn(UserRole, 'findByUserAndTeamId').mockImplementation(() => Promise.resolve(data.userRole.basic()))
    jest.spyOn(Role, 'findRolesByRoleIds').mockImplementation(() => Promise.resolve(data.roles.cohortAllowReadAccess()))

    await applyRbac(mockReq, mockNext)

    expect(mockNext).toHaveBeenCalledTimes(1)
    expect(mockNext.mock.calls[0][0]).not.toBeDefined()
  })

  test('should call next with no err if featureFlag is disabled', async () => {
    const mockNext = jest.fn()
    const mockReq = req.basic()
    jest.spyOn(UserRole, 'findByUserAndTeamId').mockImplementation(() => Promise.resolve(data.userRole.basic()))
    jest
      .spyOn(Role, 'findRolesByRoleIds')
      .mockImplementation(() => Promise.resolve(data.roles.cohortConflictingAccess()))

    await applyRbac(mockReq, mockNext, false)

    expect(mockNext).toHaveBeenCalledTimes(1)
    expect(mockNext.mock.calls[0][0]).not.toBeDefined()
  })

  test('the rbac fn should return a middleware passing the feature flag to it', async () => {
    const mockNext = jest.fn()
    jest.spyOn(UserRole, 'findByUserAndTeamId').mockImplementation(() => Promise.resolve(data.userRole.basic()))
    jest
      .spyOn(Role, 'findRolesByRoleIds')
      .mockImplementation(() => Promise.resolve(data.roles.cohortConflictingAccess()))

    await rbac(RolesRoutes.Cohort)({} as Koa.Context, mockNext)

    expect(mockNext).toHaveBeenCalledTimes(1)
    expect(mockNext.mock.calls[0][0]).not.toBeDefined()
  })
})
