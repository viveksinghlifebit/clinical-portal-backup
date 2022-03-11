import { HttpStatusCodes } from 'enums'

import AbstractHttpError from './AbstractHttpError'

class ResponseValidationHttpError extends AbstractHttpError implements App.ErrorForm {
  constructor(message: string, details?: any) {
    super(message, HttpStatusCodes.InternalServerError, HttpStatusCodes[HttpStatusCodes.InternalServerError], details)
    Object.setPrototypeOf(this, ResponseValidationHttpError.prototype)
  }
}

export default ResponseValidationHttpError
