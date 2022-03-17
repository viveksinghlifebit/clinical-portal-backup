import { accessControlRoutes } from './accessControl/accessControl.index'
import { routes as healthRoutes } from './health/routes'

export default {
  ...healthRoutes,
  ...accessControlRoutes
}
