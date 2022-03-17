import { HttpStatusCodes } from 'enums'

import AbstractHttpError from './AbstractHttpError'

class BadRequestHttpError extends AbstractHttpError implements App.ErrorForm {
  constructor(message?: string) {
    super(message || 'Bad Request.', HttpStatusCodes.BadRequest, HttpStatusCodes[HttpStatusCodes.BadRequest])
    Object.setPrototypeOf(this, BadRequestHttpError.prototype)
  }
}

export default BadRequestHttpError
