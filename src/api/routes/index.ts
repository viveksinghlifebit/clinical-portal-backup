import { accessControlRoutes } from './accessControl/routes';
import { routes as healthRoutes } from './health/routes';
import { workgroupRoutes } from './workgroup/routes';
import { comparisonRoutes } from './comparison/routes';

export default {
  ...healthRoutes,
  ...accessControlRoutes,
  ...workgroupRoutes,
  ...comparisonRoutes
};
