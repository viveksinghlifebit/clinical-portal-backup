import { HttpStatusCodes } from 'enums';

import AbstractHttpError from './AbstractHttpError';

class UnauthorizedHttpError extends AbstractHttpError implements App.ErrorForm {
  constructor(message?: string) {
    super(message || 'Unauthorized.', HttpStatusCodes.Unauthorized, HttpStatusCodes[HttpStatusCodes.Unauthorized]);
    Object.setPrototypeOf(this, UnauthorizedHttpError.prototype);
  }
}

export default UnauthorizedHttpError;
