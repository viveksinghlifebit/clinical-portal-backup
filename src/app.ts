import config from 'config'
import createApp from './createApp'
import routes from './api/routes'
import { loadEndpoints } from './api/validation'
import { log } from './services/log'
import { init as DBInit } from 'services/mongoose/index'

const app = createApp()
loadEndpoints(app, routes)
  .then(async (appInstance) => {
    appInstance.listen(config.port, () => log.info(`Server listening on port: ${config.port}`))
    await DBInit(config.mongoMulti)
  })
  .catch(log.error)
