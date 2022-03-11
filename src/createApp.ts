import Koa from 'koa'

import { middelwares } from './api/middlewares'

export default (): Koa<App.State, App.Context> => {
  const app = new Koa<App.State, App.Context>()
  middelwares.forEach((middelware) => app.use(middelware))
  return app
}
