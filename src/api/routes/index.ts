import { accessControlRoutes } from './accessControl/routes'
import { routes as healthRoutes } from './health/routes'

export default {
  ...healthRoutes,
  ...accessControlRoutes
}
