import { accessControlRoutes } from './accessControl/routes'
import { routes as healthRoutes } from './health/routes'
import { routes as workgroupRoutes } from './workgroup/routes'

export default {
  ...healthRoutes,
  ...accessControlRoutes,
  ...workgroupRoutes
}
