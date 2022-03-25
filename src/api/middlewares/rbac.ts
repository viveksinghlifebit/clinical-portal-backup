import { Types } from 'mongoose'
import { UnauthorizedHttpError, ForbiddenHttpError } from 'errors/http-errors'
import config from 'config'
import { log as logger } from 'services/log'
import { RolesRoutes } from 'enums'
import { UserRole, Role } from '@core/models'
import { RBACAction } from '@core/enums'

const findUserRoles = async (userId: Mongoose.ObjectId, teamId: Mongoose.ObjectId): Promise<Role.View[]> => {
  const userRole = await UserRole.findByUserAndTeamId(userId, teamId)
  return userRole ? Role.findRolesByRoleIds(userRole.roles as string[]) : []
}

const reqMethodToRbacAction: Record<string, RBACAction> = {
  delete: RBACAction.delete,
  get: RBACAction.read,
  patch: RBACAction.update,
  post: RBACAction.create,
  put: RBACAction.update
}

export const rbacMiddleware = (resource: RolesRoutes, featureEnabled = false) => {
  return async (ctx: Koa.Context, next: Koa.Next): Promise<void> => {
    if (!featureEnabled) {
      await next()
      return
    }

    const userId = ctx.user?._id as Types.ObjectId
    if (!userId) {
      throw new UnauthorizedHttpError()
    }

    const teamId = ctx.query.teamId as string
    const action = reqMethodToRbacAction[ctx.request.method.toLocaleLowerCase()] as RBACAction

    if (!action) {
      throw new ForbiddenHttpError(`Could not identify the RBAC action`)
    }

    let roles: Role.View[] = []
    try {
      roles = await findUserRoles(userId, new Types.ObjectId(teamId))
    } catch (err) {
      logger.error(err)
      throw new ForbiddenHttpError(`Could not find your RBAC role`)
    }

    ctx.user = {
      ...ctx.user!,
      rbacRoles: roles
    }

    logger.debug(JSON.stringify(roles))

    const permit = isAccessAllowed(roles, resource, action)

    logger.info(`rbac user=${userId} action=${action} resource=${resource} permit=${permit}`)

    if (!permit) {
      logger.error(`You don't have permissions to ${action} the ${resource} resource`)
      throw new ForbiddenHttpError(`You don’t have the right permissions. Please contact your admin`)
    }

    await next()
  }
}

export const checkWhetherUserIsPermittedForTheAction = (
  roles: Role.View[],
  resource: RolesRoutes,
  action: RBACAction
): boolean => {
  if (!config.hkgiEnvironmentEnabled) {
    return true
  }
  return isAccessAllowed(roles, resource, action)
}

export const rbac = (resource: RolesRoutes): ((ctx: Koa.Context, next: Koa.Next) => Promise<void>) => {
  return rbacMiddleware(resource, config.hkgiEnvironmentEnabled)
}
const isAccessAllowed = (roles: Role.View[], resource: RolesRoutes, action: RBACAction): boolean => {
  const accessValues = roles.reduce((acc, val) => {
    val.permissions.forEach((permission) => {
      if (permission.name === resource) {
        acc.push(permission.access[action] as boolean)
      }
    })
    return acc
  }, [] as boolean[])
  return accessValues.some((isAllowed) => isAllowed)
}
