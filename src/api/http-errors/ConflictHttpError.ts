import { HttpStatusCodes } from 'enums'

import AbstractHttpError from './AbstractHttpError'

class ConflictHttpError extends AbstractHttpError implements App.ErrorForm {
  constructor(message?: string) {
    super(message || 'Conflict', HttpStatusCodes.Conflict, HttpStatusCodes[HttpStatusCodes.Conflict])
    Object.setPrototypeOf(this, ConflictHttpError.prototype)
  }
}

export default ConflictHttpError
