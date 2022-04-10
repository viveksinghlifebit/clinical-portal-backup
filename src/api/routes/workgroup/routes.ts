import { RolesRoutes } from '@core/enums'
import { WorkgroupService } from '@core/modules'
import { ifTeamSpecifiedDo, rbac, auth, getTeamAndTeamMembershipAndCheckTheyAreActive } from 'api/middlewares'
import { HttpMethods, HttpStatusCodes } from 'enums'
import { auditTrail } from 'services/auditTrail'

interface SearchRequestBody {
  criteria: Filter.SearchItem[]
}

const createWorkgroupHandler: App.EndpointOperation = async (
  c: Koa.ParameterizedContext<App.State, App.Context>,
  { team, user }: App.AuthenticatedCloudOs
) => {
  const name = c.request.body.name as string
  const workgroup: Workgroup.Document = await WorkgroupService.createWorkgroup(name, team, user)
  c.status = HttpStatusCodes.OK
  c.body = workgroup
}

const deleteWorkgroupHandler: App.EndpointOperation = async (c: Koa.ParameterizedContext<App.State, App.Context>) => {
  const workgroupId = c.params?.id
  const { teamId } = c.request.query

  await WorkgroupService.deleteWorkgroup(workgroupId as string, teamId as string)
  c.status = HttpStatusCodes.OK
  c.body = {}
}

const searchWorkgroupHandler: App.EndpointOperation = async (
  c: Koa.ParameterizedContext<App.State, App.Context<SearchRequestBody>>,
  { user }: App.AuthenticatedCloudOs
) => {
  const { criteria } = c.request.body
  const { teamId } = c.request.query
  const { pageNumber, pageSize, sortBy, sortType } = c.request.query

  const workgroupsData = await WorkgroupService.searchWorkgroups(criteria, teamId as string, user, {
    pageNumber: parseInt(pageNumber as string),
    pageSize: parseInt(pageSize as string),
    sortBy: sortBy as string,
    sortByType: sortType as string
  })
  c.status = HttpStatusCodes.OK
  c.body = workgroupsData
}

export const workgroupRoutes: App.EndpointsInfo = {
  createWorkgroup: {
    method: HttpMethods.Post,
    path: '/individual-browser/workgroup',
    operation: createWorkgroupHandler,
    middlewares: [
      auth(['token', 'apikey']),
      rbac(RolesRoutes.IndividualBrowserWorkGroup),
      ifTeamSpecifiedDo([getTeamAndTeamMembershipAndCheckTheyAreActive])
    ],
    postMiddlewares: [auditTrail]
  },
  deleteWorkgroup: {
    method: HttpMethods.Delete,
    path: '/individual-browser/workgroup/:id',
    operation: deleteWorkgroupHandler,
    middlewares: [
      auth(['token', 'apikey']),
      rbac(RolesRoutes.IndividualBrowserWorkGroup),
      ifTeamSpecifiedDo([getTeamAndTeamMembershipAndCheckTheyAreActive])
    ],
    postMiddlewares: [auditTrail]
  },
  searchWorkgroups: {
    method: HttpMethods.Post,
    path: '/individual-browser/workgroup/search',
    operation: searchWorkgroupHandler,
    middlewares: [
      auth(['token', 'apikey']),
      rbac(RolesRoutes.IndividualBrowserWorkGroupSearch),
      ifTeamSpecifiedDo([getTeamAndTeamMembershipAndCheckTheyAreActive])
    ],
    postMiddlewares: [auditTrail]
  }
}
