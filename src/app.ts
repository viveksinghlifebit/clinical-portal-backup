import config from 'config'
import createApp from './createApp'
import routes from './api/routes'
import { loadEndpoints } from './api/validation'
import { log } from './services/log'

const app = createApp()
loadEndpoints(app, routes)
  .then((app) => {
    app.listen(config.port, () => log.info(`Server listening on port: ${config.port}`))
  })
  .catch(log.error)
