export enum HttpStatusCodes {
  OK = 200,
  Created = 201,
  NoContent = 204,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  Conflict = 409,
  InternalServerError = 500
}

export enum HttpMethods {
  Get = 'get',
  Post = 'post',
  Put = 'put',
  Head = 'head',
  Patch = 'patch',
  Delete = 'delete',
  Options = 'options'
}

// AuditTrail
export enum AuditLevel {
  Debug = 'debug',
  Info = 'info',
  Warn = 'warning',
  Error = 'error',
  Crit = 'critical',
  Fatal = 'fatal'
}

export * from '@core/enums';
