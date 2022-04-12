import Koa from 'koa';

import { middlewares } from './api/middlewares';

export default (): Koa<App.State, App.Context> => {
  const app = new Koa<App.State, App.Context>();
  middlewares.forEach((middleware) => app.use(middleware));
  return app;
};
