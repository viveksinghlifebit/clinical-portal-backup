import { RolesRoutes } from '@core/enums'
import { WorkgroupService } from '@core/modules'
import { ifTeamSpecifiedDo, rbac, auth, getTeamAndTeamMembershipAndCheckTheyAreActive } from 'api/middlewares'
import { HttpMethods, HttpStatusCodes } from 'enums'
import { auditTrail } from 'services/auditTrail'

const createWorkgroupHandler: App.EndpointOperation = async (
  c: Koa.ParameterizedContext<App.State, App.Context>,
  { team, user }: App.AuthenticatedCloudOs
) => {
  const name = c.request.body.name as string
  const workgroup: Workgroup.Document = await WorkgroupService.createWorkgroup(name, team, user)
  c.status = HttpStatusCodes.OK
  c.body = workgroup
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
  }
}
