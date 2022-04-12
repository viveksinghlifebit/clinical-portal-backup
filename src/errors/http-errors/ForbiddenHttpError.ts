import { HttpStatusCodes } from 'enums';

import AbstractHttpError from './AbstractHttpError';

class ForbiddenHttpError extends AbstractHttpError implements App.ErrorForm {
  constructor(message?: string) {
    super(message || 'Forbidden.', HttpStatusCodes.Forbidden, HttpStatusCodes[HttpStatusCodes.Forbidden]);
    Object.setPrototypeOf(this, ForbiddenHttpError.prototype);
  }
}

export default ForbiddenHttpError;
