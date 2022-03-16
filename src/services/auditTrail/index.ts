import { omit } from 'lodash'
import { Types } from 'mongoose'
import config from 'config'
import { AuditLevel } from 'enums'
import { AuditTrailService } from 'modules/auditTrail/auditTrail.controller'

export const auditTrail = async ({ request: req, state, response: res }: Koa.Context): Promise<void> => {
  const auditLogLevel = state.error ? AuditLevel.Error : AuditLevel.Info
  const elapsedProcessHrTime = process.hrtime(state.startTime)
  const responseTime = elapsedProcessHrTime[0] * 1000 + elapsedProcessHrTime[1] / 1e6
  const infoLog: AuditTrail.InfoLog = {
    actionOwner: state.user?._id.toString(),
    level: auditLogLevel,
    message: `Method: (${req.method}), Url: "${req.url}"`,
    requestId: state.requestId,
    metadata: {
      request: {
        method: req.method,
        url: req.url,
        ip: req.ip,
        body: req.body
      },
      response: {
        statusCode: state.responseStatusCode,
        fullHeaders: omit(res.headers, 'set-cookie', 'server-timing'),
        responseTime,
        body: state.responseBody
      },
      error: state.error
    }
  }
  if (config.hkgiEnvironmentEnabled) {
    await AuditTrailService.log(
      infoLog.message,
      infoLog.level,
      infoLog.requestId,
      infoLog.metadata,
      new Types.ObjectId(infoLog.actionOwner)
    )
  }
}
