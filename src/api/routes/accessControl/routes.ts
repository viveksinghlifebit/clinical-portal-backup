import { RoleService, UserRoleService } from '@core/modules';
import { HttpMethods, RolesRoutes, HttpStatusCodes } from 'enums';
import { rbac, auth } from 'api/middlewares';
import { getTeamAndTeamMembershipAndCheckTheyAreActive, ifTeamSpecifiedDo } from 'api/middlewares/team';
import { auditTrail } from 'services/auditTrail';

const getUserRoles: App.EndpointOperation = async (
  ctx: Koa.ParameterizedContext<App.State, App.Context>,
  { user, team }: App.AuthenticatedCloudOs
) => {
  const data = await UserRoleService.listUserRolesPaginated({ user, team });
  const response = sendResponseAsPerData<App.PaginationResponse<UserRole.RolesPopulatedView>>(data);
  ctx.status = response.status;
  ctx.body = response.data;
};

const updateUserRoles: App.EndpointOperation = async (
  ctx: Koa.ParameterizedContext<
    App.State,
    App.Context<{ userId: string | undefined; roles: string[]; email: string | undefined }>
  >,
  { team }: App.AuthenticatedCloudOs
) => {
  const { body } = ctx.request;
  const { userId, roles, email } = body;
  const data = await UserRoleService.updateUserRole({ userId, roles, email, team });
  const response = sendResponseAsPerData<UserRole.RolesPopulatedView>(data);
  ctx.status = response.status;
  ctx.body = response.data;
};

const deleteUserRoles: App.EndpointOperation = async (
  ctx: Koa.ParameterizedContext<App.State, App.Context<{ userId: string }>>,
  { team }: App.AuthenticatedCloudOs
) => {
  const { body } = ctx.request;
  const { userId } = body;
  await UserRoleService.deleteUserRole({ userId, team });
  ctx.status = HttpStatusCodes.OK;
  ctx.body = {};
};

const createUserRole: App.EndpointOperation = async (
  ctx: Koa.ParameterizedContext<App.State, App.Context<{ userId: string; roles: string[] }>>,
  { team }: App.AuthenticatedCloudOs
) => {
  const { body } = ctx.request;
  const { userId, roles } = body;
  const data = await UserRoleService.createUserRole({ userId, roles, team });
  const response = sendResponseAsPerData<UserRole.RolesPopulatedView | null>(data);
  ctx.status = response.status;
  ctx.body = data;
};

const getMyUserRoles: App.EndpointOperation = async (
  ctx: Koa.ParameterizedContext<App.State, App.Context>,
  { user, team }: App.AuthenticatedCloudOs
) => {
  const data = await UserRoleService.getMyUserRole({ user, team });
  const response = sendResponseAsPerData<UserRole.View>(data);
  ctx.status = response.status;
  ctx.body = data;
};

const createBaseUserRole: App.EndpointOperation = async (
  ctx: Koa.ParameterizedContext<App.State, App.Context>,
  { user, team }: App.AuthenticatedCloudOs
) => {
  const data = await UserRoleService.createBaseUserRole({ user, team });
  const response = sendResponseAsPerData<UserRole.View>(data);
  ctx.status = response.status;
  ctx.body = data;
};

const getRolesList: App.EndpointOperation = async (ctx: Koa.ParameterizedContext<App.State, App.Context>) => {
  const { query } = ctx.request;
  const pagination: App.PaginationRequest = {
    pageSize: Number(query.pageSize),
    pageNumber: Number(query.pageNumber)
  };
  const response = await RoleService.listRolesPaginated({ pagination });
  ctx.status = HttpStatusCodes.OK;
  ctx.body = response;
};

const createRole: App.EndpointOperation = async (ctx: Koa.ParameterizedContext<App.State, App.Context>) => {
  const { body } = ctx.request;
  const role = body;
  const data = await RoleService.createRole({ role });
  const response = sendResponseAsPerData<Role.View>(data);
  ctx.status = response.status;
  ctx.body = response.data;
};

const inviteUserRole: App.EndpointOperation = async (
  ctx: Koa.ParameterizedContext<App.State, App.Context<InvitationUserRole.InviteRequest[]>>,
  { team }: App.AuthenticatedCloudOs
) => {
  const { body } = ctx.request;
  const invitedUsers: InvitationUserRole.InviteRequest[] = body;
  await UserRoleService.invite(invitedUsers, team);
  ctx.status = HttpStatusCodes.Created;
  ctx.body = {};
};

const updateRole: App.EndpointOperation = async (ctx: Koa.ParameterizedContext<App.State, App.Context>) => {
  const { body } = ctx.request;
  const role = body;
  const data = await RoleService.updateRole({ role });
  const response = sendResponseAsPerData<Role.View>(data);
  ctx.status = response.status;
  ctx.body = response.data;
};

const deleteRole: App.EndpointOperation = async (ctx: Koa.ParameterizedContext<App.State, App.Context>) => {
  const { body } = ctx.request;
  const { name } = body;
  await RoleService.deleteRole(name);
  ctx.status = HttpStatusCodes.OK;
  ctx.body = {};
};

const sendResponseAsPerData = <T>(data: T): { status: HttpStatusCodes; data?: T } => {
  if (data) {
    return {
      status: HttpStatusCodes.OK,
      data
    };
  } else {
    return {
      status: HttpStatusCodes.NoContent
    };
  }
};

export const accessControlRoutes: App.EndpointsInfo = {
  getUserRoles: {
    method: HttpMethods.Get,
    path: '/access-control/user-roles',
    operation: getUserRoles,
    middlewares: [auth(['token', 'apikey']), ifTeamSpecifiedDo([getTeamAndTeamMembershipAndCheckTheyAreActive])],
    postMiddlewares: [auditTrail]
  },
  updateUserRoles: {
    method: HttpMethods.Put,
    path: '/access-control/user-roles',
    operation: updateUserRoles,
    middlewares: [
      auth(['token', 'apikey']),
      ifTeamSpecifiedDo([getTeamAndTeamMembershipAndCheckTheyAreActive]),
      rbac(RolesRoutes.AccessControlUserRoles)
    ],
    postMiddlewares: [auditTrail]
  },
  deleteUserRoles: {
    method: HttpMethods.Delete,
    path: '/access-control/user-roles',
    operation: deleteUserRoles,
    middlewares: [
      auth(['token', 'apikey']),
      ifTeamSpecifiedDo([getTeamAndTeamMembershipAndCheckTheyAreActive]),
      rbac(RolesRoutes.AccessControlUserRoles)
    ],
    postMiddlewares: [auditTrail]
  },
  createUserRole: {
    method: HttpMethods.Post,
    path: '/access-control/user-roles',
    operation: createUserRole,
    middlewares: [
      auth(['token', 'apikey']),
      ifTeamSpecifiedDo([getTeamAndTeamMembershipAndCheckTheyAreActive]),
      rbac(RolesRoutes.AccessControlUserRoles)
    ],
    postMiddlewares: [auditTrail]
  },
  getMyUserRoles: {
    method: HttpMethods.Get,
    path: '/access-control/roles/me',
    operation: getMyUserRoles,
    middlewares: [auth(['token', 'apikey']), ifTeamSpecifiedDo([getTeamAndTeamMembershipAndCheckTheyAreActive])],
    postMiddlewares: [auditTrail]
  },
  createBaseUserRole: {
    method: HttpMethods.Post,
    path: '/access-control/roles/me',
    operation: createBaseUserRole,
    middlewares: [auth(['token', 'apikey']), ifTeamSpecifiedDo([getTeamAndTeamMembershipAndCheckTheyAreActive])],
    postMiddlewares: [auditTrail]
  },
  createRole: {
    method: HttpMethods.Post,
    path: '/access-control/roles',
    operation: createRole,
    middlewares: [
      auth(['token', 'apikey']),
      ifTeamSpecifiedDo([getTeamAndTeamMembershipAndCheckTheyAreActive]),
      rbac(RolesRoutes.AccessControlRoles)
    ],
    postMiddlewares: [auditTrail]
  },
  updateRole: {
    method: HttpMethods.Put,
    path: '/access-control/roles',
    operation: updateRole,
    middlewares: [
      auth(['token', 'apikey']),
      ifTeamSpecifiedDo([getTeamAndTeamMembershipAndCheckTheyAreActive]),
      rbac(RolesRoutes.AccessControlRoles)
    ],
    postMiddlewares: [auditTrail]
  },
  deleteRole: {
    method: HttpMethods.Delete,
    path: '/access-control/roles',
    operation: deleteRole,
    middlewares: [
      auth(['token', 'apikey']),
      ifTeamSpecifiedDo([getTeamAndTeamMembershipAndCheckTheyAreActive]),
      rbac(RolesRoutes.AccessControlRoles)
    ],
    postMiddlewares: [auditTrail]
  },
  getRolesList: {
    method: HttpMethods.Get,
    path: '/access-control/roles',
    operation: getRolesList,
    middlewares: [
      auth(['token', 'apikey']),
      ifTeamSpecifiedDo([getTeamAndTeamMembershipAndCheckTheyAreActive]),
      rbac(RolesRoutes.AccessControlRoles)
    ],
    postMiddlewares: [auditTrail]
  },
  inviteUserRole: {
    method: HttpMethods.Post,
    path: '/access-control/invited-role',
    operation: inviteUserRole,
    middlewares: [
      auth(['token', 'apikey']),
      ifTeamSpecifiedDo([getTeamAndTeamMembershipAndCheckTheyAreActive]),
      rbac(RolesRoutes.AccessControlRoles)
    ],
    postMiddlewares: [auditTrail]
  }
};
